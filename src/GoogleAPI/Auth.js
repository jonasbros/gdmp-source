import React from 'react';

import { GoogleLogin } from 'react-google-login';

class GoogleAuth extends React.Component{
    constructor(props) {
        super(props);

        this.state = { response: null };
    }

    response = (response) => {
        console.log(response);
        this.props.response(response);
    }

    render() {
        return (
            <GoogleLogin
                clientId="61296320304-4mrg5qmerjt2ejamn22e1a7ti9t5bo9b.apps.googleusercontent.com"
                buttonText="Sign in with Google"
                onSuccess={this.response}
                onFailure={this.response}
                cookiePolicy={'single_host_origin'}
                isSignedIn={true}
                theme="dark"
                scope="https://www.googleapis.com/auth/drive"
                />            
        );
    }
}

export default GoogleAuth;
