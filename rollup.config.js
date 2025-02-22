import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import del from 'rollup-plugin-delete';
import typescript from '@rollup/plugin-typescript';
import preserveDirectives from 'rollup-plugin-preserve-directives';

const plugins = [
    process.env.NODE_ENV === 'production' ? del({
        targets: 'dist/**'
    }) : undefined,
    resolve(),
    commonjs(),
    typescript({
        tsconfig: './tsconfig.json'
    }),
    process.env.NODE_ENV === 'production' ? terser({ compress: { directives: false } }) : undefined,
    preserveDirectives()
];

const onwarn = (msg, handler) => {
    if (msg.code === 'THIS_IS_UNDEFINED') return;
    if (msg.code === 'MODULE_LEVEL_DIRECTIVE') return;

    handler(msg);
};

export default {
    input: ['src/index.ts'],
    external: ['react', /react\-dom/, /react\/jsx\-runtime/, /@infinityfx\/lively/, /@infinityfx\/fluid/, /react\-icons/, 'tslib'],
    output: {
        dir: 'dist',
        format: 'es',
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: 'src'
    },
    plugins,
    onwarn
}