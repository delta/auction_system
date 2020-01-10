const Sequelize = require('sequelize');
const models = require(__dirname + '/../../models/');
const bidManager = require('./bidManager');

let adminSockets = {}; // {"admin1": {socket, id}, "admin2": {socket, id}};
let clientSockets = {}; // {"room1": {"u1": socket, "u2": socket}, "room2": {"u3": socket}}

//Auction owner creating a room
function ownerSocket(socket, namespace, owner_id) {
    //update adminSockets
    adminSockets[namespace] = {socket: socket, id: owner_id};
    //add a entry in clientSockets for owner's room
    clientSockets[namespace] = {};
    //initialize bid
    bidManager.creatingBid(namespace);
    socket.emit('success', 'Auction opened successfully!!');
}
function currentCatalog(socket, namespace, owner_id, catalog) {
    adminSockets[namespace] = {
        socket: socket,
        id: owner_id,
        currentCatalog: catalog
    };
    console.log('catalog ', catalog);
    socket.broadcast.to(namespace).emit('currentCatalog', catalog);
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
    //store user_id & namespace data in socket session for this client
    socket.user_id = user_id;
    socket.namespace = namespace;

    //check is auction open
    if (clientSockets[namespace] === undefined) {
        //no room found (auction is closed or does not exist)
        socket.emit('auctionClosed', 'Auction is either closed or not open yet!');
    } else {
        //if auction is live
        //update clinetSockets by adding client entry to correct room
        clientSockets[namespace][user_id] = socket;
        //add client to auction room
        socket.join(namespace);
        console.log('currentCatalog', adminSockets[namespace].currentCatalog);
        socket.emit('currentCatalog', adminSockets[namespace].currentCatalog);
        // send current bidDetails to this newly added client
        bidManager.showCurrentBid(socket, namespace);

        //inform owner with updated list of active clientIds
        adminSockets[namespace].socket.emit('onlineUsers', Object.keys(clientSockets[namespace]));
    }
}

module.exports = {
    ownerSocket,
    closeAuction,
    joinAuction,
    clientSockets,
    adminSockets,
    currentCatalog
};
