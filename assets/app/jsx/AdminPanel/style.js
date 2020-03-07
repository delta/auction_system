export const style = {
    formBox: {
        width: '600px',
        height: '600px',
        position: 'absolute',
        left: '45%',
        top: '50%',
        margin: '-300px 0 0 -150px'
    },
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
    },

    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        margin: '1em'
    },

    topContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: '2em',
        marginBottom: '2em'
    },

    allBidsContainer: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    },

    currentBidContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },

    catalogsContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
    },

    activeUsersContainer: {
        display: 'flex',
        flexDirection: 'column',
        margin: '2em'
    },
    usersGrid: {
        display: 'flex',
        flexFlow: 'row wrap'
    },
    userListItem: {
        width: '33vw',
        textAlign: 'center'
    }
};