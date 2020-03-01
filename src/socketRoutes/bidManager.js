const Sequelize = require('sequelize');
const models = require(__dirname + '/../../models/');

let bidDetails = {}; // {"room1": {currentBid: 34, bidHolderId: 1}, "room2": {currentBid: 21, bidHolderId: 9}} current bidValues in each room

//creating a Bid
function creatingBid(namespace) {
    bidDetails[namespace] = [
        {
            currentBid: 0,
            bidHolderId: -1,
            bidHolderName: '-'
        }
    ];
    return;
}

//delete bid
function deleteBid(namespace) {
    delete bidDetails[namespace];
    return;
}

function deleteBids(io, socket, allBids, namespace, owner_id, catalog) {
    let updateBid = allBids.reverse();
    bidDetails[namespace] = updateBid;
    socket.broadcast.to(namespace).emit('currentBidStatus', updateBid[updateBid.length - 1]);
}

//show currentBids
function showCurrentBid(socket, namespace) {
    //send current bidDetails to this newly added client
    let bid = bidDetails[namespace];
    socket.emit('currentBidStatus', bid[bid.length - 1]);
    return;
}
function getCurrentBid(namespace) {
    let bid = bidDetails[namespace];
    return bid[bid.length - 1];
}

function showAllBid(namespace) {
    return bidDetails[namespace];
}
function resetBid(io, namespace, user_id, userName, bid_value) {
    bidDetails[namespace] = [
        {
            currentBid: 0,
            bidHolderId: -1,
            bidHolderName: '-'
        }
    ];
    let bid = bidDetails[namespace];
    io.sockets.in(namespace).emit('currentBidStatus', bid[bid.length - 1]);
    return;
}

//handle bids for different auctions
function handleBid(io, socket, namespace, user_id, userName, bid_value, clientSocket) {
    if (!clientSocket) return;

    // check if the bid is within user's balance
    if (clientSocket.balance < bid_value) {
        socket.emit('notEnoughBalance');
        return;
    }

    //update bidDetails
    const object = {
        currentBid: bid_value,
        bidHolderId: user_id,
        bidHolderName: userName
    };
    bidDetails[namespace].push(object);
    let bid = bidDetails[namespace];
    // bidDetails[namespace].currentBid = bid_value;
    // bidDetails[namespace].bidHolderId = user_id;
    // bidDetails[namespace].bidHolderName = userName;

    //brodcast updated bid to all clients in the room
    io.sockets.in(namespace).emit('currentBidStatus', bid[bid.length - 1]);
    return;
}

module.exports = {
    creatingBid,
    deleteBid,
    showCurrentBid,
    handleBid,
    bidDetails,
    getCurrentBid,
    showAllBid,
    deleteBids,
    resetBid
};
