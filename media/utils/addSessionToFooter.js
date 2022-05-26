const addSessionToFooter = (session) => {
    $('body').append(`
    <footer>
        <div class="footer-container">
            <p>Session ID: ${session}</p>
        </div>
    </footer>`);
};
export default addSessionToFooter;