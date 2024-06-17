import {ReactGLXAPP} from "react-glx";
import {PointLight} from "react-glx/lights/point-light";
import {Cube} from "react-glx/primitives/cube";

const app = ReactGLXAPP(document.getElementById("webglCanvas"));
const pointLight1 = PointLight(1,[0, 0, 0]);

// add point light
app.add(pointLight1);

const cube = Cube(1, [0, 0, 0],[2.55,2.55,2.55]);
app.add(cube);