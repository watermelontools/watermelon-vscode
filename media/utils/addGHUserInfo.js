const addGHUserInfo = ({ login, avatar }) => {
    $('.replace-user-img').replaceWith(`
        <img src="${avatar}" class="login-image"/>
    `);
    console.log(login)
    $(".login-info").append(`
        <p class="login-info-text">
            Logged in as ${login}
        </p>
    `);
};
export default addGHUserInfo;