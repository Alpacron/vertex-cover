import React from 'react';
import {Alignment, Button, Navbar} from "@blueprintjs/core";

export default function NavBar() {
    return (
        <Navbar>
            <Navbar.Group align={Alignment.LEFT}>
                <Navbar.Heading>Vertex Cover</Navbar.Heading>
                <p style={{margin: 0}}>- Jelle Huibregtse & Aron Hemmes</p>
            </Navbar.Group>
            <Navbar.Group align={Alignment.RIGHT}>
                <Button className="bp3-minimal" icon="home" text="Home"/>
                <Navbar.Divider/>
                <Button className="bp3-minimal" icon="cog"/>
            </Navbar.Group>
        </Navbar>
    );
}
