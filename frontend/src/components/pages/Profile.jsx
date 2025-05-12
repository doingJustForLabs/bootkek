import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import ProfileStore from "../../store/ProfileStore.js";
import {Avatar, Button} from "antd";
import { UserOutlined, FormOutlined } from "@ant-design/icons";
import NavLayout from "../layouts/NavLayout.jsx";

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await ProfileStore.getProfile();
                setAvatar(response.data.profile.avatar_basename);
                setProfileData(response.data.profile);
            } catch (error) {
                switch (error.response?.status) {
                    case 401: navigate("/"); break;
                    case 404: navigate("/profile/create"); break;
                    default: navigate("/"); break;
                }
            }
        };

        fetchProfile();
    }, [navigate]);

    return (
        <NavLayout>
            <div className="flex justify-center min-h-screen bg-none">
                <div style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "red"
                }}>
                    <div style={{height:'25vh', backgroundColor:'green'}}>Обложка</div>
                    <div style={{height:'100px', padding:'0px 50px', backgroundColor: 'blue', display: 'flex'}}>
                        <Avatar
                            size={150}
                            src={avatar ? `http://127.0.0.1:8000/${avatar}_256.jpg` : undefined}
                            icon={!avatar && <UserOutlined />}
                            style={{ backgroundColor: '#f0f0f0', marginTop: '-50px'
                        }}
                        />
                        <h2 style={{alignSelf: 'center', margin: '0px 20px'}}>
                            <span style={{fontSize: '28px', fontWeight: 'bold'}}>
                                {profileData ? profileData.name : undefined}
                            </span>
                            <br/>
                            <span style={{color: 'gray'}}>
                                @{profileData ? profileData.username : undefined}
                            </span>
                        </h2>

                        <div style={{ flex: '1', backgroundColor: 'red', display:'flex', flexDirection: 'row-reverse'}}>
                            <Button
                                style={{ margin: '10px', alignSelf:'center', fontSize: "16px"}}
                                icon={<FormOutlined />}
                                onClick={() => navigate("/profile/edit")}
                            >
                                Редактировать
                            </Button>
                        </div>


                    </div>
                    <div style={{padding:'25px 50px', backgroundColor: 'pink', height:'100%'}}>Всякая инфа</div>
                </div>
            </div>
        </NavLayout>
    );
};

export default Profile;
