{ pkgs, ... }: {
  channel = "stable-23.11";

  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
  ];

  env = {};

  idx = {
    extensions = [];

    previews = {
      enable = true;
      previews = {
        web = {
          command = [
            "npm"
            "run"
            "dev"
            "--prefix"
            "frontend"
            "--"
            "--port"
            "$PORT"
            "--host"
            "0.0.0.0"
          ];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
      };
    };

    workspace = {
      onCreate = {
        install-backend = "cd backend && npm install";
        install-frontend = "cd frontend && npm install";
      };
      onStart = {
        start-backend = "cd backend && npm run dev &";
      };
    };
  };
}
