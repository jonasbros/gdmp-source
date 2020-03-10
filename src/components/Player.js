import React from 'react';
import gdrive from 'google-drive';
import loaderGif from './../loader.gif';

class Player extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            audiofiles: null,
            playlist: <span className="has-text-light">Looking for audio...</span>,
            audio: '',
            nowPlaying: {
                id: null,
                title: '',
                link: '',
            }, 
            isPaused: true,
            isShuffled: false,
            isRepeat: false,
            isLoading: true,
            duration: 0,
            currentTime: 0,
            volume: 0.5,
        };

        this.audioRef = React.createRef();
        this.seekerRef = React.createRef();
        this.volumeRef = React.createRef();

        this.seekerInterval = null;
        
    } 

    componentDidMount() {
        // get all files
        this.fetchAudio();
        this.audioRef.current.onpause = () => {
            this.setState({isPaused: this.audioRef.current.paused});
        } 

        this.audioRef.current.onplay = () => {
            this.setState({isPaused: this.audioRef.current.paused});
        }
    }

    fetchAudio = () => {
        gdrive(this.props.userData.accessToken).files().list({
            q: "mimeType contains 'audio/'",
            maxResults: 999
        }, this.callback);
    }

    fetchAudioNextPage(pageToken) {
        gdrive(this.props.userData.accessToken).files().list({
            q: "mimeType contains 'audio/'",
            maxResults: 999,
            pageToken: pageToken
        }, this.callback);
    }

    callback = (err, response, body) => {
        if (err) return console.log('err', err);
        this.setState({ isLoading: true });

        let audioFiles = null;
        
        body = JSON.parse(body);
        console.log(body);
        if( this.state.audiofiles === null ) {
            audioFiles = body.items;  
        }else {
            audioFiles = this.state.audiofiles;
            audioFiles = audioFiles.concat(body.items);
        }        

        if( this.state.audiofiles === null ) {
            this.setState({ playlist: <span>No audio files found...</span> });
        }

        let tmp_list = ( audioFiles.map((i, key) => (
            <p key={key} className="playlist-item" onClick={this.play.bind(this, { key: key, item: i })}>{i.title}</p>
        )) ); 

        this.setState({ audiofiles: audioFiles, playlist: tmp_list });  
        if( body.nextPageToken ) {
            this.fetchAudioNextPage(body.nextPageToken);
        }else {
            this.setState({ isLoading: false });
        }
    }

    highlightNowPlaying = (prevID, newID) => {        
        let playlistItems = document.querySelectorAll('.playlist-item');

        if( prevID !== null ) {
            playlistItems[prevID].classList.remove('is-playing');
        }
        playlistItems[newID].classList.add('is-playing');
    }

    toggleShuffle = () => {
        this.setState({ isShuffled: !this.state.isShuffled });
    }

    toggleRepeat = () => {
        this.setState({ isRepeat: !this.state.isRepeat });
    }

    togglePlay = () => {
        if( this.audioRef.current.paused ) {
            this.audioRef.current.play();
            this.updateSeeker();
        }else {
            this.audioRef.current.pause();
            this.stopSeeker();
        }
    }

    changeVolume = () => {
        let newVolume = this.volumeRef.current.value;
        this.audioRef.current.volume = newVolume;
        this.setState({ volume: newVolume });
    }

    userSeek = () => {
        let newTime = this.seekerRef.current.value * this.audioRef.current.duration;
        this.audioRef.current.currentTime = newTime;
    }

    updateSeeker = () => {    
        this.seekerInterval = setInterval(() => { 
            this.setState({ currentTime: this.audioRef.current.currentTime / this.audioRef.current.duration });
        }, 1000);

        const seekerInterval = this.seekerInterval;

        this.setState({ seekerInterval });
    }
 
    stopSeeker = () => {
        clearInterval(this.seekerInterval);        
    }

    //todo PREVIOUS and NEXT buttons
    next = () => {               
        if( this.state.isShuffled ) {
            this.shuffle();
        }else if( this.state.nowPlaying.id < this.state.audiofiles.length ) {
            this.play({ key: this.state.nowPlaying.id + 1, item: this.state.audiofiles[this.state.nowPlaying.id + 1]});
        }
    } 

    prev = () => {        
        if( this.state.isShuffled ) {
            this.shuffle();
        }else if( this.state.nowPlaying.id > 0 ) {
            this.play({ key: this.state.nowPlaying.id - 1, item: this.state.audiofiles[this.state.nowPlaying.id - 1]});
        }
    }

    shuffle = () => {
        let shuffle_index = Math.floor((Math.random() * (this.state.audiofiles.length - 1)) + 0);
        this.play({ key: shuffle_index, item: this.state.audiofiles[shuffle_index] });
    }

    play = (audio) => {
        let prevID = this.state.nowPlaying.id;
        console.log(audio.item);
        this.stopSeeker();

        let link = audio.item.webContentLink.replace('&export=download', '');
        this.setState({ 
            nowPlaying: {
                id: audio.key,
                title: audio.item.title,
                link: link,
            },
            isPaused: true, 
        }, () => {
            this.highlightNowPlaying(prevID, audio.key);

            console.log(this.audioRef.current.src); 
            this.audioRef.current.oncanplay = () => {
                this.audioRef.current.play();             
                this.updateSeeker();     
            }  
            
            this.audioRef.current.onended = () => {    
                this.next();
            }
        });       
    }

    render() {       
        return (
            <div className="player__container columns is-vcentered is-centered is-multiline">
                <div className="player__inner">
                    <div className="player__player">
                        <div className="player__header">
                            <h3 className="has-text-info">Now Playing</h3>
                            <p>{ this.state.nowPlaying.id !== null ? this.state.nowPlaying.title : 'No Song' }</p>
                            <div onClick={this.prev} className="player__prevnext player__prev-btn">
                                <i className="fas fa-step-backward"></i>
                            </div>
                            <div onClick={this.next} className="player__prevnext player__next-btn">
                                <i className="fas fa-step-forward"></i>
                            </div>
                        </div>
                        
                        <div className="player__player-controls">
                            <div className="play-pause__btn" onClick={this.togglePlay}>
                                <i className={(this.state.isPaused ? "fas fa-play" : "fas fa-pause")}></i>                                
                            </div>
                            <div className="shuffle__btn" onClick={this.toggleShuffle}>
                                <i className={"fas fa-random " + (this.state.isShuffled ? "has-text-info" : "")}></i>                                
                            </div>
                            <div className="repeat__btn" onClick={this.toggleRepeat}>
                                <i className={"fas fa-infinity " + (this.state.isRepeat ? "has-text-info" : "")}></i>                                
                            </div>  
                            
                            <div className="volume__control">
                                <input 
                                    ref={this.volumeRef}
                                    onChange={this.changeVolume}
                                    id="volume"
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={this.state.volume}
                                    disabled={this.state.nowPlaying.id === null ? true : false}
                                />
                            </div>

                            <div className="seeker__control">
                                <input 
                                    ref={this.seekerRef}
                                    onChange={this.userSeek}
                                    id="seeker"
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={this.state.currentTime}
                                    disabled={this.state.nowPlaying.id === null ? true : false}
                                />
                            </div>
                        </div>
                        
                        <audio
                            hidden
                            controls
                            autoPlay
                            volume="0.5"
                            loop={ this.state.isRepeat ? true : false }
                            ref={this.audioRef}
                            src={ this.state.nowPlaying.link }                            
                        >
                                Your browser does not support the
                                <code>audio</code> element.
                        </audio>                        
                    </div>

                    <div className="player__playlist"> 
                        <div className="player__playlist-inner has-background-light">
                            <div style={{display: this.state.isLoading ? 'none' : 'block'}}>
                                { this.state.playlist }
                            </div>
                            
                            <div className={this.state.isLoading ? "loader-gif active" : "loader-gif"}>
                                <img src={loaderGif} />
                            </div>
                        </div>      
                    </div>
                </div>                               
            </div> 
        );
    }
}

export default Player;
