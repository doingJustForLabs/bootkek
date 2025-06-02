import React from 'react';
import ButtonFollowUser from "components/ui/buttons/ButtonFollowUser.jsx";
import ButtonUnfollowUser from "components/ui/buttons/ButtonUnfollowUser.jsx";
import ButtonEditProfile from "components/ui/buttons/ButtonEditProfile.jsx";
import {CloseOutlined} from "@ant-design/icons";
import {goToProfile} from "utils/navigator.js";
import {Button} from "antd";
import ButtonSave from "components/ui/buttons/ButtonSave.jsx";
import ButtonPersonalChat from "components/ui/buttons/ButtonPersonalChat.jsx";

const ProfileButtonsPanel = ({context = "other", profileData = {}, actions = {}, preview = false, style}) => {

    switch (context) {
        case "other":
            return (
                <div className="buttons-panel" style={style}>
                    {profileData.is_following ? (
                        <ButtonUnfollowUser text={!preview && "Отписаться"} shape={preview && "circle"} showTip={preview} targetUserId={profileData.user_id} onRefresh={actions?.fetchProfile}/>
                    ) : (
                        <ButtonFollowUser text={!preview &&"Подписаться"} shape={preview && "circle"} showTip={preview} targetUserId={profileData.user_id} onRefresh={actions?.fetchProfile}/>
                    )}
                    <ButtonPersonalChat text={!preview && "Чат"} shape={preview && "circle"} targetUserId={profileData.user_id} showTip={preview}/>
                </div>
            )

        case "me":
            return (
                <div className="buttons-panel" style={style}>
                    <ButtonEditProfile text={!preview && "Редактировать"} shape={preview && "circle"} showTip={preview}/>
                </div>
            )

        case "edit":
            return (
                <div className="buttons-panel" style={style}>
                    <ButtonSave text="Сохранить" shape={preview && "circle"} onClick={actions.handleSave}/>
                    <Button
                        size="large"
                        shape="circle"
                        style={{ margin: '5px', alignSelf: 'center', fontSize: "20px" }}
                        icon={<CloseOutlined />}
                        onClick={() => {goToProfile(profileData.user_id)}}
                    />
                </div>

            )

    }
};


export default ProfileButtonsPanel;