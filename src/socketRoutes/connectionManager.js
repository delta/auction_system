const Sequelize = require('sequelize');
const models = require(__dirname + '/../../models/');

let adminSockets = {}; // {"admin1": {socket, id}, "admin2": {socket, id}};
let clientSockets = {}; // {"room1": {"u1": socket, "u2": socket}, "room2": {"u3": socket}}
let bidDetails = {}; // {"room1": {currentBid: 34, bidHolderId: 1}, "room2": {currentBid: 21, bidHolderId: 9}} current bidValues in each room

//Auction owner creating a room
function ownerSokcet(socket, namespace, owner_id) {
    //update adminSockets
    adminSockets[namespace] = {socket: socket, id: owner_id};
    //add a entry in clientSockets & bidDetails for owner's room
    clientSockets[namespace] = {};
    bidDetails[namespace] = {currentBid: 0, bidHolderId: -1};
    socket.emit('success', 'Auction opened successfully!!');
}

//Closing a auction
function closeAuction(socket, io, namespace, owner_id) {
    //delete clients entry & bidDetails
    delete clientSockets[namespace];
    delete bidDetails[namespace];

    //broadcast close auction message to all clients on the room
    socket.broadcast.to(namespace).emit('auctionClosed', 'Auction is closed now!');

    //delete all clients connected to this room
    io.of('/')
        .in(namespace)
        .clients((error, socketIds) => {
            console.log(socketIds);
            if (error) throw error;

            socketIds.forEach(socketId => io.sockets.sockets[socketId].leave(namespace));
        });

    socket.emit('sucess', 'Auction closed successfully');
    //delete owner entry
    delete adminSockets[namespace];
    //disconnect from owner socket
    socket.disconnect(0);
}

//Handling new clinet connection for a specific auction
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
        //send cuurent bidDetails to this newly added client
        socket.emit('currentBidStatus', bidDetails[namespace]);
        //inform owner with updated list of active clientIds
        adminSockets[namespace].socket.emit('onlineUsers', Object.keys(clientSockets[namespace]));
    }
}

//TODO: move this function to bidManager.js
//handle bids for different auctions
function handleBid(socket, io, namespace, user_id, bid_value) {
    //update bidDetails
    bidDetails[namespace].currentBid = bid_value;
    bidDetails[namespace].bidHolderId = user_id;
    //brodcast updated bid to all clients in the room
    io.sockets.in(namespace).emit('currentBidStatus', bidDetails[namespace]);
}

module.exports = {ownerSokcet, closeAuction, joinAuction, handleBid, clientSockets, adminSockets, bidDetails};
