const addGHUserInfo = ({ login, avatar }) => {
    $('.replace-user-img').replaceWith(`
        <img src="${avatar}" class="login-image"/>
    `);
};
export default addGHUserInfo;