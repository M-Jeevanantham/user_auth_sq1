import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../Login";
import Register from "../Register";
import Profile from "../Profile";
const route = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <Login />
            },
            {
                path: "/login",
                element: <Login />
            },
            {
                path: "/register",
                element: <Register />
            },
            {
                path: "/profile",
                element: <Profile />
            }
        ]
    }
]); 
export default route;