const addGHUserInfo = ({login, avatar}) => {
    $('.wm-logo').after(`
    <span class='loginHolder'>
        <img src="${avatar}" />
        <p>Logged in as ${login}</p>
    </span>`);
};
export default addGHUserInfo;