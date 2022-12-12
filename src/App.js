import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from "react-tsparticles";
import Register from './components/Register/Register';
import Signin from './components/Signin/Signin';
import './App.css';
import { Component } from 'react';
import { loadFull } from 'tsparticles';

const particlesOptions = {
  background: {
      color: {
          value: "none",
      },
  },
  fpsLimit: 120,
  interactivity: {
      events: {
          onClick: {
              enable: true,
              mode: "push",
          },
          onHover: {
              enable: true,
              mode: "repulse",
          },
          resize: true,
      },
      modes: {
          bubble:{
            distance: 400,
            duration: 2,
            opacity: 0.8,
            size: 40
          },
          push: {
              quantity: 4,
          },
          repulse: {
              distance: 200,
              duration: 0.4,
          },
      },
  },
  particles: {
      color: {
          value: "#ffffff",
      },
      links: {
          color: "#ffffff",
          distance: 150,
          enable: true,
          opacity: 0.5,
          width: 1,
      },
      collisions: {
          enable: true,
      },
      move: {
          directions: "none",
          enable: true,
          outModes: {
              default: "bounce",
          },
          random: false,
          speed: 6,
          straight: false,
      },
      number: {
          density: {
              enable: true,
              area: 800,
          },
          value: 80,
      },
      opacity: {
          value: 0.5,
      },
      shape: {
          type: "circle",
      },
      size: {
          value: { random: true, value:5 },
      },
  },
  detectRetina: true,
};

const initialState = {
  input: '',
  imageUrl:'',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email:'',
    entries: 0,
    joined: ''
  }
};

class App extends Component {
  constructor(){
    super();
    this.state =initialState
  }

  calculateFaceLocation = (data) =>{
    const clarifyFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifyFace.left_col * width,
      topRow: clarifyFace.top_row * height,
      rightCol: width - (clarifyFace.right_col * width),
      bottomRow: height - (clarifyFace.bottom_row * height)
    }
  }

  displayFacebox = (box) =>{
    this.setState({box: box});
  }

  loadUser = (data) =>{
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  onInputChange = (event) =>{
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () =>{
    this.setState({imageUrl: this.state.input});

    fetch('https://facerecognition-api-production.up.railway.app/imageurl',{
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(response => response.json())
    .then(result => {
      if(result){
        fetch('https://facerecognition-api-production.up.railway.app/image',{
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        }).then(response =>response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries: count}))
        });
        this.displayFacebox(this.calculateFaceLocation(result))
      }
    })
    .catch(error => console.log('error', error));
  }

  onRouteChange = (route) =>{
    if(route === 'signout'){
      this.setState(initialState);
    }else if(route === 'home'){
      this.setState({ isSignedIn: true})
    }
    this.setState({route : route});

  }


  particlesInit =  async engine =>{
    await loadFull(engine);
  }

  particlesLoaded = async container =>{
  await console.log(container);
  };
  

  render() {
    const {isSignedIn, imageUrl, route, box} = this.state;
    return(
    <div className="App">
       <Particles
            id="tsparticles"
            init={this.particlesInit}
            loaded={this.particlesLoaded}
            options={particlesOptions}
        />
      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
     {route ==='home' 
        ? <div>
        <Logo />
        <Rank name={this.state.user.name} entries={this.state.user.entries} />
        <ImageLinkForm 
          onInputChange={this.onInputChange} 
          onButtonSubmit={this.onButtonSubmit}
        />
        <FaceRecognition box={box} imageUrl={imageUrl}/>
        </div>
        : (
          (route==='signin' || route ==='signout')
          ? <Signin loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/> 
          : <Register loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/>
          ) }
    </div>
  )};
}

export default App;
