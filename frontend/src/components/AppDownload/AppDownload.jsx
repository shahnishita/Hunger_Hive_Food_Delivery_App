import React from 'react'
import './AppDownload.css'
import { assets } from '../../assets/assets'
const AppDownload=() => {
    return(
<div className='app-download' id='app-download'>
<p>For better Experience Download <br/> HugerHive App</p>
<div>
    <img src={assets.play_store} alt=""/>
    <img src={assets.app_store} alt=""/>

</div>
</div>
    )
}
export default AppDownload