const Sequelize = require(__dirname + '/../../models/index');
const models = require(__dirname + '/../../models/');
const bidManager = require('./bidManager');

let adminSockets = {}; // {"admin1": {socket, id}, "admin2": {socket, id}};
let clientSockets = {}; // {"room1": {"u1": socket, "u2": socket}, "room2": {"u3": socket}}

function getAllClientSockets (namespace) {
    return clientSockets[namespace];
};

function getAdminSocket (namespace) {
    return adminSockets[namespace].socket;
};

//Auction owner creating a room
function ownerSocket(socket, config) {
    const namespace = config.url_slug;
    //update adminSockets
    adminSockets[namespace] = {
        socket: socket,
        id: config.owner_id,
        max_user: config.max_user,
        is_open: config.is_open,
        can_register: config.can_register,
        paused: false,
        secretBid: false
    };
    //add a entry in clientSockets for owner's room
    clientSockets[namespace] = {};
    //initialize bid
    bidManager.creatingBid(namespace);
    socket.emit('success', 'Auction opened successfully!!');
}
function currentCatalog(socket, namespace, owner_id, catalog) {
    adminSockets[namespace] = {
        ...adminSockets[namespace],
        socket: socket,
        id: owner_id,
        currentCatalog: catalog
    };
    socket.broadcast.to(namespace).emit('currentCatalog', catalog);
    socket.emit('currentCatalog', catalog);
}

// TODO: migrate all bidding functions to nid manager
function skipBidding(io, socket, namespace, user_id, catalogName) {
    adminSockets[namespace] = {
        ...adminSockets[namespace],
        socket,
        id: user_id,
        currentCatalog: ''
    };

    socket.broadcast.to(namespace).emit('catalogSkip', catalogName);
    socket.emit('skipBiddingSuccess');
    resumeBidding(io, socket, namespace);
    bidManager.resetBid(io, namespace, '-', -1, 0);
}

function stopBidding(io, socket, namespace, user_id, catalog, isSecretBid) {
    
    let bidDetails = {};
    
    if(!isSecretBid){
        bidDetails = bidManager.getCurrentBid(namespace);
    }else {
        bidDetails = bidManager.getHighestSecretBid(namespace);
    }

    let clientSocket = clientSockets[namespace][bidDetails.bidHolderId];

    if (!clientSocket) {
        socket.emit('notifyError', 'No bid for this item');
        return;
    }

    // check if the bid is within user's balance
    if (clientSocket.balance < bidDetails.currentBid) {
        socket.emit('notifyError', 'Not enough balance');
        return;
    }

    Sequelize.sequelize
        .transaction(t => {
            return models.AuctionSummary.create(
                {
                    user_id: bidDetails.bidHolderId,
                    item_id: catalog.id,
                    final_price: bidDetails.currentBid
                },
                {transaction: t}
            ).then(response => {
                return models.User.decrement(
                    {balance: bidDetails.currentBid},
                    {
                        where: {
                            id: bidDetails.bidHolderId
                        },
                        transaction: t
                    }
                );
            });
        })
        .then(user => {
            clientSocket.balance -= bidDetails.currentBid;
            clientSocket.emit('updateBalance', clientSocket.balance);

            adminSockets[namespace] = {
                ...adminSockets[namespace],
                socket,
                id: user_id,
                currentCatalog: ''
            };

            socket.emit('stopBiddingSuccess', catalog, bidDetails);
            socket.broadcast
                .to(namespace)
                .emit('currentCatalogSold', adminSockets[namespace].currentCatalog, catalog, bidDetails);
            resumeBidding(io, socket, namespace);
            bidManager.resetBid(io, namespace, '-', -1, 0);
        })
        .catch(err => {
            socket.emit('notifyError', er.message);
        });

    return;
}

function pauseBidding(io, socket, namespace) {
    adminSockets[namespace].paused = true;
    let bidDetails = bidManager.showAllBid(namespace);
    socket.emit('allBids', bidDetails);
    socket.broadcast.to(namespace).emit('pausedBidding');
}

function resumeBidding(io, socket, namespace) {
    adminSockets[namespace].paused = false;
    socket.broadcast.to(namespace).emit('resumeBidding');
}

function changeSecretBidStatus(io, socket, namespace, isSecretBid) {
    adminSockets[namespace].secretBid = isSecretBid;
    socket.broadcast.to(namespace).emit('secretBidStatus', isSecretBid);
}

function changeRegistrationStatus(io, socket, namespace) {
    adminSockets[namespace].can_register = !adminSockets[namespace].can_register;
}

//Closing a auction
function closeAuction(socket, io, namespace, owner_id) {
    //delete clients entry & bidDetails
    delete clientSockets[namespace];
    bidManager.deleteBid(namespace);

    //broadcast close auction message to all clients on the room
    socket.broadcast.to(namespace).emit('auctionClosed', 'Auction is closed now!');

    //delete all clients connected to this room
    io.of('/')
        .in(namespace)
        .clients((error, socketIds) => {
            if (error) throw error;

            socketIds.forEach(socketId => io.sockets.sockets[socketId].leave(namespace));
        });

    socket.emit('success', 'Auction closed successfully');
    //delete owner entry
    delete adminSockets[namespace];
    //disconnect from owner socket
    socket.disconnect(0);
}

//Handling new client connection for a specific auction
function joinAuction(socket, namespace, user_id) {
    if (clientSockets[namespace] === undefined) {
        //no room found (auction is closed or does not exist)
        socket.emit('auctionClosed', 'Auction is either closed!');
    } else if (!adminSockets[namespace].can_register) {
        socket.emit('registrationsClosed');
    } else if (Object.keys(clientSockets[namespace]).length + 1 > adminSockets[namespace].max_user) {
        socket.emit('max_limit_exceeded');
    } else {
        const handshakeData = socket.request;
        let u_id = handshakeData._query.userIdForAuth;
        let user_token = handshakeData._query.user_token;

        models.User.findOne({where: {id: u_id, token: user_token}, raw: true, logging: false})
            .then(function(user) {
                if (user) {
                    //store user_id & namespace data in socket session for this client
                    socket.user_id = user_id;
                    socket.namespace = namespace;
                    socket.balance = user.balance;
                    //if auction is live
                    //update clinetSockets by adding client entry to correct room
                    clientSockets[namespace][user_id] = socket;
                    //add client to auction room
                    socket.join(namespace);

                    let hasSecretBid = bidManager.hasSecretBid(namespace, user_id);

                    socket.emit(
                        'joinedSuccessful',
                        adminSockets[namespace].paused,
                        socket.balance,
                        adminSockets[namespace].secretBid,
                        hasSecretBid
                    );
                    socket.emit('currentCatalog', adminSockets[namespace].currentCatalog);
                    // send current bidDetails to this newly added client
                    bidManager.showCurrentBid(socket, namespace);

                    //inform owner with updated list of active clientIds
                    adminSockets[namespace].socket.emit('onlineUsers', Object.keys(clientSockets[namespace]));
                } else {
                    socket.emit('authError');
                }
            })
            .catch(function(err) {
                console.log('ERROR: ' + err.message);
                socket.emit('authError');
            });
    }
}

function leaveAuction(socket, user_id, namespace) {
    if (user_id && namespace && clientSockets[namespace] != undefined) {
        delete clientSockets[namespace][user_id];
        adminSockets[namespace].socket.emit('onlineUsers', Object.keys(clientSockets[namespace]));
    }
}

module.exports = {
    ownerSocket,
    closeAuction,
    joinAuction,
    clientSockets,
    adminSockets,
    currentCatalog,
    stopBidding,
    leaveAuction,
    pauseBidding,
    resumeBidding,
    skipBidding,
    changeRegistrationStatus,
    getAllClientSockets,
    getAdminSocket,
    changeSecretBidStatus
};
