FROM ruby:2.6

ENV BUNDLER_VERSION 2.0.2
WORKDIR /app

COPY Gemfile Gemfile.lock ./

RUN gem install bundler && \
#    bundle config --global frozen 1 && \
    bundle install

COPY server.rb config.ru ./
CMD bundle
CMD rackup --host 0.0.0.0 -p 3000