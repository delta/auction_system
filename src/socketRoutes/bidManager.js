const Sequelize = require('sequelize');
const models = require(__dirname + '/../../models/');

let bidDetails = {}; // {"room1": {currentBid: 34, bidHolderId: 1}, "room2": {currentBid: 21, bidHolderId: 9}} current bidValues in each room
let secretBidDetails = [];

//creating a Bid
function creatingBid(namespace) {
    bidDetails[namespace] = [
        {
            currentBid: 0,
            bidHolderId: -1,
            bidHolderName: '-'
        }
    ];
    secretBidDetails[namespace] = [];
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

function deleteSecretBids(io, socket, secretBids, deleteSecretBids, namespace, owner_id, catalog) {
    const connectionManager = require('./connectionManager');
    let updateBid = secretBids;
    secretBidDetails[namespace] = updateBid;
    const clientSockets = connectionManager.getAllClientSockets(namespace);

    deleteSecretBids.forEach(id => {
        let clientSocket = clientSockets[parseInt(id)];
        clientSocket.emit('canSecretBid');
    });
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

function getHighestSecretBid(namespace){
    let secretBids = secretBidDetails[namespace];

    let bid = secretBids.reduce((previous,current)=>{
        return (previous.currentBid > current.currentBid) ? previous: current   
    },{currentBid:0,bidHolderId:0,bidHolderName:''})

    return bid;
}

function showAllBid(namespace) {
    return bidDetails[namespace];
}

function hasSecretBid(namespace, userId) {
    let alreadyBid = false;

    secretBidDetails[namespace].forEach(bid => {
        if (bid.bidHolderId === userId) {
            alreadyBid = true;
        }
    });

    return alreadyBid;
}

function allSecretBids(namespace) {
    return secretBidDetails[namespace];
}
function resetBid(io, namespace, user_id, userName, bid_value) {
    bidDetails[namespace] = [
        {
            currentBid: 0,
            bidHolderId: -1,
            bidHolderName: '-'
        }
    ];
    secretBidDetails[namespace] = [];
    let bid = bidDetails[namespace];
    io.sockets.in(namespace).emit('currentBidStatus', bid[bid.length - 1]);
    return;
}

function handleSecretBid(io, socket, namespace, user_id, userName, bid_value, clientSocket, adminSocket) {
    if (!clientSocket) return;

    if (clientSocket.balance < bid_value) {
        socket.emit('notEnoughBalance');
        return;
    }

    let alreadyBid = false;

    secretBidDetails[namespace].forEach(bid => {
        if (bid.bidHolderId === user_id) {
            alreadyBid = true;
        }
    });

    if (alreadyBid) {
        clientSocket.emit('alreadyBid');
        return;
    }

    const bid = {
        currentBid: bid_value,
        bidHolderId: user_id,
        bidHolderName: userName
    };

    secretBidDetails[namespace].push(bid);

    adminSocket.emit('currentAllSecretBids', secretBidDetails[namespace]);

    return;
}

//handle bids for different auctions
function handleBid(io, socket, namespace, user_id, userName, bid_value, clientSocket, adminSocket) {
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

    adminSocket.emit('currentAllBids', bidDetails[namespace]);

    let bid = bidDetails[namespace];

    //brodcast updated bid to all clients in the room
    io.sockets.in(namespace).emit('currentBidStatus', bid[bid.length - 1]);
    adminSocket.emit('currentBidStatus', bid[bid.length - 1]);
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
    resetBid,
    handleSecretBid,
    allSecretBids,
    hasSecretBid,
    getHighestSecretBid,
    deleteSecretBids
};
