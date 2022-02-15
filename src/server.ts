import app from "./app";

const server: any = app.listen(app.get("port"), () => {
    console.log(
        "  la aplicacion se ejecutra en http://localhost:%d en modo %s",
        app.get("port"),
        app.get("env")
    );
    console.log("  CTRL-C para terminar\n");
});

export default server;
