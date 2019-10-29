import React from 'react';
import styled from 'styled-components'
import {
    PRIMARY_BACKGROUND,
    BORDER_RADIUS,
    BORDER_BOTTOM_HEADER,
    HEADER_FONT_COLOR,
    HEADER_FONT_SIZE,
} from './styles'
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
var message = ""


export default class Input extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            width: 0, 
            height: 0,
            message: 'test',
         };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.handleMessageChange = this.handleMessageChange.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }
    
    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }
      
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
      
    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    handleMessageChange(event) {
        this.setState({message: event.target.value})
    }

    sendMessage() {
        this.props.send(this.state.message)
    }

    render() {
        return (
            <Background
                style={{
                    height: 70,
                }}>
                <Header>
                </Header>
                <Container>
                    <Form
                        style={{
                            width: this.state.width ,
                            paddingRight: 5,
                        }}>
                        <Form.Control onChange={this.handleMessageChange} placeholder="Type message" />
                    </Form>
                    <Button onClick={this.sendMessage}>send</Button>
                </Container>
            </Background>
        )
    }
}

const Background = styled.div`
    background: ${PRIMARY_BACKGROUND};
    border-radius: ${BORDER_RADIUS};
    padding: 10px;
    box-shadow: 0px 3px 10px rgba(0,0,0,0.9);
`;

const Header = styled.h1`
    border-bottom: ${BORDER_BOTTOM_HEADER};
    font-size: ${HEADER_FONT_SIZE};
    color: ${HEADER_FONT_COLOR};
`;

const Container = styled.div`
    display: flex;
    flex-direction: row;
`;