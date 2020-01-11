const Sequelize = require('sequelize');
const models = require(__dirname + '/../../models/');

let bidDetails = {}; // {"room1": {currentBid: 34, bidHolderId: 1}, "room2": {currentBid: 21, bidHolderId: 9}} current bidValues in each room

//creating a Bid
function creatingBid(namespace) {
    bidDetails[namespace] = {
        currentBid: 0,
        bidHolderId: -1,
        bidHolderName: '-'
    };
    return;
}

//delete bid
function deleteBid(namespace) {
    delete bidDetails[namespace];
    return;
}

//show currentBids
function showCurrentBid(socket, namespace) {
    //send current bidDetails to this newly added client
    socket.emit('currentBidStatus', bidDetails[namespace]);
    return;
}
function getCurrentBid(namespace) {
    return bidDetails[namespace];
}

//handle bids for different auctions
function handleBid(io, namespace, user_id, userName, bid_value) {
    //update bidDetails
    bidDetails[namespace].currentBid = bid_value;
    bidDetails[namespace].bidHolderId = user_id;
    bidDetails[namespace].bidHolderName = userName;

    //brodcast updated bid to all clients in the room
    io.sockets.in(namespace).emit('currentBidStatus', bidDetails[namespace]);
    return;
}

module.exports = {
    creatingBid,
    deleteBid,
    showCurrentBid,
    handleBid,
    bidDetails,
    getCurrentBid
};
