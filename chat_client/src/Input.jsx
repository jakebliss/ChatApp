import React from 'react';
import styled from 'styled-components'
import {
    PRIMARY_BACKGROUND,
    BORDER_RADIUS,
    BORDER_BOTTOM_HEADER,
    HEADER_FONT_SIZE,
    BODY_FONT_SIZE,
    HEADER_FONT_COLOR,
    LOGIN_PADDING,
} from './styles'
import Form from "react-bootstrap/Form";

export default class Input extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //state
        }
    }
    render() {
        return (
            <Background>
                <Form>
                    <Form.Control placeholder="Type message" />
                </Form>
            </Background>
        )
    }
}

const Background = styled.div`
    background: ${PRIMARY_BACKGROUND};
    border-radius: ${BORDER_RADIUS};
    padding: ${LOGIN_PADDING};
`;