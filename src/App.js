import React from 'react';
import './App.css';

import Auth from './GoogleAPI/Auth';
import Player from './components/Player';
import Intro from './components/Intro';

import { GoogleLogout } from 'react-google-login';


class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            response: { accessToken: null },
        };
    }
    
    response = (response) => {
        this.setState({response: response});
    }

    logout = (response) => {
        console.log(response);
        this.setState({ response: { accessToken: null } });
    }
    render() {
        
        let content;
        
        if( this.state.response.accessToken ) { 
            //if logged in
            content = (                        
                <div style={{height: '100%'}}>
                    <Player userData={this.state.response} />
                    <GoogleLogout
                    clientId="61296320304-4mrg5qmerjt2ejamn22e1a7ti9t5bo9b.apps.googleusercontent.com"
                    buttonText="Logout"
                    onLogoutSuccess={this.logout}
                    > 
                    </GoogleLogout>
                </div>
            )                        
        }else {
            content = (            
                <div className="intro__container columns is-vcentered is-centered">    
                    <div className="column is-half">
                        <div className="intro__inner">
                            <Intro />
                            <Auth response={this.response}/>
                        </div>   
                    </div>                                      
                </div>         
            )
        }
        
        return (
            <div className="App container is-fluid">         
                {content}                             
            </div>
        );
    } // render
} // class

export default App;
