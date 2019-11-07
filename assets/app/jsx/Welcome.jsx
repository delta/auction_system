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

class Welcome extends Component {
    render() {
        return (
            <div>
                <div style={style.container}>
                    <div style={style.title}>Welcome</div>
                </div>
            </div>
        );
    }
}

export default Welcome;
