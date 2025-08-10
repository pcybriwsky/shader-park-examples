import preBuildShaderParkThreejs from './vite-plugin-prebuild-sp-three';

export default {
    plugins: [preBuildShaderParkThreejs()],
    server: {
        port: 5173,
        open: true
    },
    build: {
        rollupOptions: {
            input: {
                main: './index.html',
                twist: './twist.html'
            }
        }
    }
};