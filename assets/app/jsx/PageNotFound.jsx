import React, {Component} from 'react';

const style = {
    container: {
        textAlign: 'center'
    },
    title: {
        fontWeight: 'lighter',
        fontSize: '96px'
    }
};

class PageNotFound extends Component {
    render() {
        return (
            <div>
                <div style={style.container}>
                    <div style={style.title}>Page not found</div>
                </div>
            </div>
        );
    }
}

export default PageNotFound;
