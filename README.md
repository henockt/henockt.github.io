### henockt.github.io (Hugo / PaperMod branch)

My personal site at [henockt.github.io](https://henockt.github.io), rebuilt with
[Hugo](https://gohugo.io) and the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme.
The original hand-written site lives on the `main` branch.

Local preview:

```sh
git submodule update --init --recursive
hugo server
```

Deploys via `.github/workflows/hugo.yml` when Pages → Source is set to **GitHub Actions**.

### License

[MIT](LICENSE) for the code. Project screenshots under `static/images/` belong to their
respective repositories: [relay](https://github.com/henockt/relay) and
[cello](https://github.com/henockt/cello).
