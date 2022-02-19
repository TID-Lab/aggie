import React, { Component } from 'react';
import axios from 'axios';
import {Container, Col, Row, Card, Form} from "react-bootstrap";
import StatsBar from '../components/StatsBar';
import {User} from "../objectTypes";

type TParams = { id: string };

interface IProps {
    match: {
        params: {
            id: string;
        }
    }
}

interface IState {
    user: User | null;
}
class ResetPassword extends Component<IProps, IState> {
    // Initialize the state
    constructor(props: IProps){
        super(props);
        this.state = {
            user: null,
        }
    }
    //{ match }: RouteComponentProps<TParams>)
    // Fetch the sources on first mount.

    // Retrieves the list of sources from the Express app
    // Fetch the user info on first mount.
    componentDidMount() {
        this.getUser();
    }

    // Retrieves the list of sources from the Express app
    getUser = () => {
        axios.get('/api/v1/user/' + this.props.match.params.id).then(res => {
            const user = res.data;
            this.setState({ user });
        })
    }

    render() {
        let user: User | null;
        user = this.state.user;
        return (
            <div>
                <Container fluid>
                    <Row>
                        <Col>
                        </Col>
                        <Col xl={9}>
                            <Form noValidate>
                                <Form.Group controlId="loginForm.formUsername" className={"mb-3"}>
                                    <Form.Label>Tag name</Form.Label>
                                    <Form.Control required type="name" placeholder="Username"/>
                                </Form.Group>
                                <Form.Group controlId="loginForm.formPassword" className={"mb-3"}>
                                    <Form.Label>Tag name</Form.Label>
                                    <Form.Control required type="password" placeholder="Username"/>
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default ResetPassword;


