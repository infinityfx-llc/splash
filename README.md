# Splash

[![NPM package](https://img.shields.io/npm/v/@infinityfx/splash)](https://www.npmjs.com/package/@infinityfx/splash)
[![NPM bundle size](https://img.shields.io/bundlephobia/minzip/@infinityfx/splash)](https://bundlephobia.com/package/@infinityfx/splash)
[![Last commit](https://img.shields.io/github/last-commit/infinityfx-llc/splash)](https://github.com/infinityfx-llc/splash)
![NPM weekly downloads](https://img.shields.io/npm/dw/@infinityfx/splash)
![NPM downloads](https://img.shields.io/npm/dt/@infinityfx/splash)

React toast notifications for Fluid UI.

# Get started

## Installation

```sh
$ npm i @infinityfx/splash
```

## Usage

```tsx
import { useSplash } from '@infinityfx/splash';

const { splash } = useSplash();

splash({
    title: 'My toast',
    color: 'green',
    icon: <Checkmark />
});
```