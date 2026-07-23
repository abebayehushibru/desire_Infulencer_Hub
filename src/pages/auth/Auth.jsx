import { Outlet } from "react-router-dom"

import CreateBusiness from "../business/Createbusiness"
import Header from "../../components/header"

const Auth =()=>{
    return <div className="">
        <Header/>
        <div className="mx-auto my-6  p-4 rounded-lg max-w-7xl  ">
             <Outlet/>

        </div>
    
    </div>
}

export default Auth