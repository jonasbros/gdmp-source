import React from 'react';

class Intro extends React.Component{
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div className="intro__text"> 
                <h1 className="has-text-info">Google Drive Music Player</h1>
                <p>A music player for Google Drive that finds all audio files in your drive and compiles them to a single playlist.</p>
                <p><a href="https://jonasbros.github.io/dbxmp">DBXMP</a>'s big brother.</p>
            </div> 
        );
    }
}

export default Intro;
