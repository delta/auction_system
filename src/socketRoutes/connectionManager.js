const Sequelize = require('sequelize');
const models = require(__dirname + '/../../models/');
const bidManager = require('./bidManager');

let adminSockets = {}; // {"admin1": {socket, id}, "admin2": {socket, id}};
let clientSockets = {}; // {"room1": {"u1": socket, "u2": socket}, "room2": {"u3": socket}}

//Auction owner creating a room
function ownerSocket(socket, namespace, owner_id, max_user) {
    //update adminSockets
    adminSockets[namespace] = {
        socket: socket,
        id: owner_id,
        max_user,
        paused: false
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
}
function stopBidding(io, socket, namespace, user_id, catalogName) {
    adminSockets[namespace] = {
        ...adminSockets[namespace],
        socket,
        id: user_id,
        currentCatalog: ''
    };
    const bidDetails = bidManager.getCurrentBid(namespace);
    socket.broadcast.to(namespace).emit('catalogSold', catalogName, bidDetails);
    socket.emit('stopBiddingSuccess', bidDetails);
    socket.broadcast.to(namespace).emit('currentCatalogSold', adminSockets[namespace].currentCatalog);
    bidManager.resetBid(io, namespace, '-', -1, 0);
    return;
}

function pauseBidding(io, socket, namespace, owner_id, catalog) {
    adminSockets[namespace].paused = true;
    let bidDetails = bidManager.showAllBid(namespace);
    socket.emit('allBids', bidDetails);
    socket.broadcast.to(namespace).emit('pausedBidding');
}

function resumeBidding(io, socket, namespace, owner_id, catalog) {
    socket.broadcast.to(namespace).emit('resumeBidding');
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
    //check is auction open
    if (clientSockets[namespace] === undefined) {
        //no room found (auction is closed or does not exist)
        socket.emit('auctionClosed', 'Auction is either closed or not open yet!');
    } else if (Object.keys(clientSockets[namespace]).length + 1 > adminSockets[namespace].max_user) {
        socket.emit('max_limit_exceeded');
    } else {
        //store user_id & namespace data in socket session for this client
        socket.user_id = user_id;
        socket.namespace = namespace;
        //if auction is live
        //update clinetSockets by adding client entry to correct room
        clientSockets[namespace][user_id] = socket;
        //add client to auction room
        socket.join(namespace);
        socket.emit('currentCatalog', adminSockets[namespace].currentCatalog);
        // send current bidDetails to this newly added client
        bidManager.showCurrentBid(socket, namespace);
        socket.emit('joinedSuccessful');
        if (adminSockets[namespace].paused) {
            socket.emit('pausedBidding');
        }
        //inform owner with updated list of active clientIds
        adminSockets[namespace].socket.emit('onlineUsers', Object.keys(clientSockets[namespace]));
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
    resumeBidding
};
