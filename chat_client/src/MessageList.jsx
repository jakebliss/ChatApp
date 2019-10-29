import React from 'react';
import {
    PRIMARY_BACKGROUND,
    BORDER_RADIUS,
    BORDER_BOTTOM_HEADER,
    HEADER_FONT_SIZE,
    BODY_FONT_SIZE,
    HEADER_FONT_COLOR,
    LOGIN_PADDING,
    LIST_FONT_COLOR,
} from './styles'
import styled from 'styled-components'

export default class MessageList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { width: 0, height: 0 };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
      }
      
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
      
    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
      }

    render() {
        const {
            messages = ["No messages to display yet"]
        } = this.props;

        const messages_list = messages.map((message) => 
            <Messages>
                {message}
            </Messages>
        )

        return(
            <Background 
                style={{
                    height: this.state.height * .70,
                    width: this.state.width * .73,
                }}>
                    <Header>
                    Beginning of Messages
                </Header>
                { messages_list }
                <div style={{ float:"left", clear: "both" }}
                    ref={(el) => { this.messagesEnd = el; }}>
                </div>
            </Background>
        )
    }
}

const Background = styled.div`
    background: ${PRIMARY_BACKGROUND};
    border-radius: ${BORDER_RADIUS};
    padding: ${LOGIN_PADDING};
    box-shadow: 0px 3px 7px rgba(0,0,0,0.9);
    overflow-y: auto;
`;

const Header = styled.h1`
    border-bottom: ${BORDER_BOTTOM_HEADER};
    font-size: ${HEADER_FONT_SIZE};
    color: ${HEADER_FONT_COLOR};
    padding: ${LOGIN_PADDING};
`;

const Messages = styled.p`
    color: ${LIST_FONT_COLOR};
    font-size: ${BODY_FONT_SIZE};
    height: "100%";
`;