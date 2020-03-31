import React, {Component, createRef} from 'react';
import './App.css'
class App extends Component {
    state = {
        color: '',
        pictures: [],
    };
    canvasMethod = () => {
        let canvas = this.canvas.current;
        let ctx = canvas.getContext('2d');

        this.state.pictures.forEach(item => {
            ctx.beginPath();
            ctx.arc(item.x, item.y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = item.color;
            ctx.fill();
            ctx.stroke();
        })
    };
    componentDidMount() {
        this.websocket = new WebSocket('ws://localhost:8000/draw');
        this.websocket.onmessage = (message) => {
            try {
                const data = JSON.parse(message.data);
                switch (data.type) {
                    case 'NEW_PICTURE':
                        this.setState({pictures:[...this.state.pictures, {x: data.x, y: data.y, color: data.color}]});
                        this.canvasMethod();
                        break;
                    case 'LAST_PICTURES':
                        this.setState({pictures: data.pictures});
                        this.canvasMethod();
                        break;
                    default:
                        console.log('No type ' + data.type)
                }
            }catch (e) {
                console.error('Something went wrong', e)
            }

        };
    }
    colorChanger = e => this.setState({color: e.target.value});
    submitColor = e => {
        e.preventDefault();
        if (isNaN(this.state.color)) {
            const color = {
                type: 'COLOR_CHANGER',
                color: this.state.color
            };
            this.websocket.send(JSON.stringify(color));
        } else if(this.state.color === ''){
            alert('Вы ничего не ввели')
        } else {
            alert('Вы ввели число')
        }

    };
    canvas = createRef();
    onCanvasClick = e => {

        e.persist();

        const canvas = this.canvas.current;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        const x = e.clientX - rect.left - 5;
        const y = e.clientY - rect.top - 5;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = this.state.color;
        ctx.fill();
        ctx.stroke();

        const message = {
            type: 'CREATE_PICTURE',
            x: x,
            y: y,
        };
        this.websocket.send(JSON.stringify(message));
    };
    render() {
        return (

            <div>
                <form onSubmit={this.submitColor}>
                    <div className='block'>
                        <label htmlFor="field">Цвет</label>
                        <input type="text" onChange={this.colorChanger} className='field' id='field'/>
                        <button type='submit'>Change</button>
                    </div>
                </form>
                <canvas
                    width='1000'
                    height='800'
                    ref={this.canvas}
                    onClick={this.onCanvasClick}
                    style={{border: '2px solid black', margin: '2% 0 0 15%', borderRadius: '5px'}}/>
            </div>
        );
    }
}

export default App;