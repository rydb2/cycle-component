## simple easy create component
```bash
node scripts/generate.js -t dom -n Button
```

## About icons
use **material design svg sprite symbol**[Link](https://material.io/icons/)
```js
// example
Icon({
  props$: Observable.of({
    DOM: DomSource,
    name: 'file.file_download'
  })
})
```

## Loading animation use spinkit
