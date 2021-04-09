import React from 'react';
import {Alignment, Button, Navbar} from "@blueprintjs/core";

export default function () {
    return (
        <Navbar>
            <Navbar.Group align={Alignment.LEFT}>
                <Navbar.Heading>Vertex Cover</Navbar.Heading>
                <Navbar.Divider/>
                <Navbar.Heading style={{marginLeft: "1em"}}>by Jelle Huibregtse & Aron Hemmes</Navbar.Heading>
            </Navbar.Group>
            <Navbar.Group align={Alignment.RIGHT}>
                <Button className="bp3-minimal" icon="home" text="Home"/>
                <Navbar.Divider/>
                <Button className="bp3-minimal" icon="cog"/>
            </Navbar.Group>
        </Navbar>
    );
}
