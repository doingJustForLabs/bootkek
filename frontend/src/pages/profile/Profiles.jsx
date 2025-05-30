import {useState, useEffect} from 'react';
import ProfileStore from "store/ProfileStore.js";
import NavLayout from "components/layouts/NavLayout.jsx";
import ProfilePreview from "components/ui/profile/ProfilePreview.jsx";
import {wrapHandleError} from "utils/errors.js";
import ProfilesList from "components/ui/profile/ProfilesList.jsx";

const Profiles = () => {
    const [profiles, setProfiles] = useState([]);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                await wrapHandleError(async () => {
                    const response = await ProfileStore.getAllProfiles();
                    setProfiles(response.data.profiles);
                })();
            } catch (error) {
                const status = error.response?.status;
                if (status === 404) setNotFound(true);
            }
        };

        fetchProfiles();
    }, []);

    if (notFound) {
        return (
            <NavLayout>
                <div className="flex justify-center items-center min-h-screen">
                    <h1 className="text-2xl text-gray-600">Профили не найдены...</h1>
                </div>
            </NavLayout>
        );
    }

    return (
        <NavLayout>
            <ProfilesList profilesData={profiles}/>
        </NavLayout>
    );
};

export default Profiles;
