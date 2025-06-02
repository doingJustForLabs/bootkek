import React, { useState, useEffect } from 'react';
import ProfileStore from "store/ProfileStore.js";
import NavLayout from "components/layouts/NavLayout.jsx";
import { wrapHandleError } from "utils/errors.js";
import ProfilesList from "components/ui/profile/ProfilesList.jsx";
import SearchInput from "components/ui/inputs/SearchInput.jsx";
import Pagination from "components/ui/Pagination.jsx";
import SkillsList from "components/ui/profile/SkillsList.jsx";
import ProfilePreview from "components/ui/profile/ProfilePreview.jsx";
import { goToProfile } from "utils/navigator.js";

const SearchProfiles = () => {
    const [profiles, setProfiles] = useState([]);
    const [notFound, setNotFound] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [limit] = useState(8);
    const [filter, setFilter] = useState({});

    const handleSearch = async (searchKeyword, page = 1, limitValue = limit, searchFilter = filter) => {
        try {
            setKeyword(searchKeyword);
            setCurrentPage(page);
            setFilter(searchFilter);

            await wrapHandleError(async () => {
                const response = await ProfileStore.getProfilesBySearch(searchKeyword, page, limitValue, searchFilter);
                setProfiles(response.data.profiles);
                setTotalPages(response.data.total_pages);
                setNotFound(false);
            })();
        } catch (error) {
            const status = error.response?.status;
            if (status === 404) {
                setProfiles([]);
                setTotalPages(1);
                setNotFound(true);
            }
        }
    };

    useEffect(() => {
        handleSearch('', 1, limit, {});
    }, []);

    const handlePageChange = (newPage) => {
        handleSearch(keyword, newPage, limit, filter);
    };

    const handleSearchSubmit = (searchKeyword, searchFilter) => {
        handleSearch(searchKeyword, 1, limit, searchFilter);
    };

    return (
        <NavLayout>
            <div style={{ justifySelf: "center", width: "40%" }}>
                <SearchInput
                    onSearch={handleSearchSubmit}
                    initialFilter={filter}
                />
            </div>

            <div style={{
                width: "60%",
                display: "flex",
                backgroundColor: "#f4f4f4",
                flexDirection: "column",
                margin: '0 auto',
                padding: '22px',
                gap: "15px",
                borderRadius: '50px',
                alignItems: 'center'
            }}>
                <ProfilesList
                    profilesData={profiles}
                    renderItem={(profile) => (
                        <ProfilePreview key={profile.user_id} profileData={profile} avatarSize={64} onClick={() => goToProfile(profile.user_id)}>
                            {profile.skills.length > 0 ? (
                                <SkillsList skills={profile.skills} limit={2} style={{ justifyContent: "flex-end" }} />
                            ) : null}
                        </ProfilePreview>
                    )}
                />
            </div>

            {totalPages > 1 && (
                <div style={{ justifySelf: "center" }}>
                    <Pagination
                        style={{ marginLeft: 'auto' }}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </NavLayout>
    );
};

export default SearchProfiles;
