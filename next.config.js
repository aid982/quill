/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack:(config,{buildId,dev,isServer,defaultLoaders,webpack})=>{
        config.resolve.alias.canvas = false;
        config.resolve.alias.encoding = false;
        return config;

    },
    images: {
        domains: ['lh3.googleusercontent.com','ejrxwrsfermpvmaxzybl.supabase.co'],
        
      },

}

module.exports = nextConfig
