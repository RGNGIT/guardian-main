const execSync = require('child_process').execSync;
const spawn = require('child_process').spawn;
const fs = require('fs');

(async () => {
    await execSync(`yarn`, { stdio: 'inherit', shell: true });
    const buildAndWatch = async (folder, skipWatch = false) => {
        const log = (message) => console.log(`${folder}: ${message}`);


        if (skipWatch) {
            log('skip watch project')
            return;
        }

        if (!fs.existsSync(folder + '/dist/')) {
            await execSync(`yarn build --cwd ${folder}`, { stdio: 'inherit', shell: true });
        }

        await new Promise((resolve) => {
            log('Watching changes...');
            const child = spawn('yarn', ['--cwd', folder, 'dev'], { shell: true });

            child.stdout.on('data', log);
            child.stderr.on('data', log);

            child.on('close', (code) => {
                resolve(code)
            });
        });

    }
    console.log('Building and watching...');
    await Promise.all([
        "interfaces",
        "common",
        "logger-service",
        "frontend",
        "auth-service",
        "guardian-service",
        "api-gateway",
        "mrv-sender",
        "ipfs-client",
        "topic-viewer"
    ].map(project => buildAndWatch(project, project === "frontend")));
})();