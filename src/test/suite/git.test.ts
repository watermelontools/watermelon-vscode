import * as assert from "assert";
import * as gitUrlParse from "git-url-parse";

suite("Git tests", () => {
    const testCases = [
        { protocol: "http", url: "http://github.com/watermelontools/wm-extension.git" },
        { protocol: "http", url: "http://estebandalelr@github.com/watermelontools/wm-extension.git" },
        { protocol: "https", url: "https://github.com/watermelontools/wm-extension.git" },
        { protocol: "https", url: "https://estebandalelr@github.com/watermelontools/wm-extension.git" },
        { protocol: "git", url: "git://github.com/watermelontools/wm-extension.git/" },
        { protocol: "ssh", url: "git@github.com:watermelontools/wm-extension.git" },
        { protocol: "ssh", url: "ssh://github.com/watermelontools/wm-extension.git" },
        { protocol: "ssh", url: "ssh://github.com:watermelontools/wm-extension.git" },
        { protocol: "ssh", url: "ssh://watermelontools@github.com/wm-extension.git" },
        { protocol: "ssh", url: "watermelontools@github.com:wm-extension.git" },
    ];
    for (let index = 0; index < testCases.length; index++) {
        const element = testCases[index];
        test(`should parse user, repo, source and protocol from "${element.url}"`, () => {
            let { owner, name, source, protocol } = gitUrlParse(element.url);
            assert.strictEqual(owner, "watermelontools");
            assert.strictEqual(name, "wm-extension");
            assert.strictEqual(source, "github.com");
            assert.strictEqual(protocol, element.protocol);
        });
    }
});