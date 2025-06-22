{
  inputs = {
    nixpkgs.url = "github:cachix/devenv-nixpkgs/rolling";
    devenv.url = "github:cachix/devenv";
  };

  nixConfig = {
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = "https://devenv.cachix.org";
  };

  outputs =
    {
      self,
      nixpkgs,
      devenv,
      ...
    }@inputs:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs {
        inherit system;
        config = {
          allowUnfree = true;
        };
      };
    in
    {
      packages.${system} = {
        devenv-up = self.devShells.${system}.default.config.procfileScript;
        devenv-test = self.devShells.${system}.default.config.test;
      };
      devShells.${system}.default = devenv.lib.mkShell {
        inherit inputs pkgs;
        modules = [
          (
            { pkgs, config, ... }:
            {
              packages = [
                pkgs.watchman
                pkgs.gradle
              ];

              android = {
                enable = true;
                reactNative.enable = true;

                # # --- Customization for React Native/Expo ---
                # platforms.version = [
                #   "34"
                #   "35"
                # ]; # Add more if needed
                # buildTools.version = [
                #   "34.0.0"
                #   "35.0.0"
                # ]; # Add more if needed
                # platformTools.version = "34.0.5";
                # tools.version = "26.1.1";
                # cmdLineTools.version = "11.0";
                # cmake.version = [ "3.22.1" ];
                # abis = [
                #   "arm64-v8a"
                #   "x86_64"
                # ];
                # systemImageTypes = [ "google_apis_playstore" ];
                # emulator = {
                #   enable = true;
                #   version = "34.1.9";
                # };
                # ndk.enable = true;
                # googleAPIs.enable = true;
                # googleTVAddOns.enable = true;
                # extras = [ "extras;google;gcm" ];
                # extraLicenses = [
                #   "android-sdk-preview-license"
                #   "android-googletv-license"
                #   "android-sdk-arm-dbt-license"
                #   "google-gdk-license"
                #   "intel-android-extra-license"
                #   "intel-android-sysimage-license"
                #   "mips-android-sysimage-license"
                # ];
                # android-studio = {
                #   enable = true;
                #   package = pkgs.android-studio;
                # };
                # sources.enable = false;
                # systemImages.enable = true;
              };
            }
          )
        ];
      };
    };
}
