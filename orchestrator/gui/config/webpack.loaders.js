const file_loader = {
  loader: 'file-loader',
  options: {
    name: 'assets/[ext]/[name].[ext]'
  }
};

export default {
  css: {
    loader: 'css-loader',
    options: {
      url: false
    }
  },
  file: file_loader,
  less: {
    loader: 'less-loader',
    options: {
      lessOptions: {
        strictMath: true
      }
    }
  },
  url: {
    loader: 'url-loader',
    options: {
      limit: 10 * 1024,
      fallback: file_loader
    }
  }
};