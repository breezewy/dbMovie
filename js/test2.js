 
        // 抽离出来的几个页面公用的方法
       var Helper = {
            // 判断是否滚动到页面底部的方法
           isToEnd:function($viewport,$content){
               return $viewport.height()+$viewport.scrollTop()+30 >= $content.height();
           },
           
           // 创建节点的方法
           createNode:function(movie){
            //    页面创建打断的html字符串的方法
               var tpl = `
                        <div class="item">
                            <a href="#">
                                <div class="cover">
                                    <img src="" alt="">
                                </div>
                                <div class="detail">
                                    <h2></h2>
                                    <div class="extra"><span class="score"></span> /<span class="collect"></span>收藏</div>
                                    <div class="extra"><span class="year"></span> /<span class="type"></span></div>
                                    <div class="extra">导演：<span class="director"></span></div>
                                    <div class="extra">主演：<span class="actor"></span></div>
                                </div>
                            </a>
                         </div>
                        `
                    var $node = $(tpl);
                    $node.find('a').attr('href', movie.alt);
                    $node.find('.cover img').attr('src', movie.images.medium);
                    $node.find('.detail h2').text(movie.title);
                    $node.find('.detail .score').text(movie.rating.average);
                    $node.find('.collect').text(movie.collect_count);
                    $node.find('.year').text(movie.year);
                    $node.find('.type').text(movie.genres.join('/'));
                    $node.find('.director').text(function () {
                        var directorArr = [];
                        movie.directors.forEach(function (item) {
                            directorArr.push(item.name);
                        })
                        return directorArr.join('、');
                    });
                    $node.find('.actor').text(function () {
                        var actorArr = [];
                        movie.casts.forEach(function (item) {
                            actorArr.push(item.name);
                        })
                        return actorArr.join('、');
                    })
                    return $node;
           }
       }

        // top250页面
       var top250 = {
           init:function(){
               this.$container = $('#top250');
               this.$content = this.$container.find('.container');
               this.index = 0;  
               this.isLoading = false;  //是否正在加载，默认是加载完毕
               this.isFinish = false;  

               this.bind();
               this.start();
           },
           bind:function(){
               var _this = this;
               this.$container.scroll(function(){
                  if(!_this.isFinish&& Helper.isToEnd(_this.$container,_this.$content)){
                      _this.start();
                  }
               })
           },
           start:function(){
               var _this = this;
               this.getData(function(data){
                   _this.render(data);
               })
           },
           getData:function(callback){
               var _this = this;
               if(this.isLoading) return;  //如果加载完，就不再继续请求数据
               _this.isLoading = true;     //如果已经加载完毕，就设置为true
               _this.$container.find('.loading').show();
              $.ajax({
                  url:'https://api.douban.com/v2/movie/top250',
                  data:{
                      start:this.index||0,
                  },
                  dataType:'jsonp'
              }).done(function(ret){
                  this.index+=20
                  if(_this.index >= ret.total){
                      _this.isFinish = true;
                  }
                  callback&&callback(ret);
              }).fail(function(){
                  console.log('获取数据失败');  
              }).always(function(){
                  _this.isLoading = false;  //发出请求后，再设置为正在加载
                  _this.$container.find('.loading').hide();
              })
           },
           render:function(data){
               var _this = this;
               data.subjects.forEach(function(movie){
                   _this.$content.append(Helper.createNode(movie));
               })
           }
       }

        //北美电影页面    
       var usbox = {
            init: function () {
                this.$container = $('#beimei');
                this.$content = this.$container.find('.container');
                this.start()
            },
            start:function(){
                var _this = this;
                this.getData(function(data){
                    _this.render(data)
                })
            },
            getData:function(callback){
                var _this = this;
                 _this.$container.find('.loading').show();
                $.ajax({
                    url: 'https://api.douban.com/v2/movie/us_box',
                    dataType: 'jsonp'
                }).done(function (ret) {
                    callback && callback(ret);
                }).fail(function () {
                    console.log('获取数据失败');
                }).always(function () {
                    _this.$container.find('.loading').hide();
                })
            },
            render:function(data){
                var _this = this;
                data.subjects.forEach(function(item){
                 _this.$content.append(Helper.createNode(item.subject));
                })
            }
        }


        //搜索页面 
        var search = {
                init: function () {
                    this.$container = $('#search');
                    this.$input = this.$container.find('input');
                    this.$btn = this.$container.find('.btn');
                    this.$content = this.$container.find('.search-result');
                    this.bind();
                },
                bind: function () {
                    var _this = this;
                    this.$btn.on('click',function(){
                       _this.keyword =  _this.$input.val()
                       _this.start();
                    })
                },
                start:function(){
                    var _this = this;
                    this.getData(function(data){
                        _this.render(data);
                    })
                },
                getData:function(callback){
                    var _this = this;
                     _this.$container.find('.loading').show();
                    $.ajax({
                        url:'https://api.douban.com/v2/movie/search',
                        data:{
                            q:_this.keyword
                        },
                        dataType:'jsonp'
                    }).done(function(ret){
                        callback  && callback(ret);
                    }).fail(function(){
                        console.log('error...');
                    }).always(function(){
                        _this.$container.find('.loading').hide();
                    })
                },
                render:function(data){
                    var _this = this;
                    data.subjects.forEach(function(item){
                        _this.$content.append(Helper.createNode(item));
                    }) 
                }
            }


        // 总的管理方法
       var app = {
           init:function(){
               this.$tabs = $('footer>div');
               this.$panel = $('section');
               this.bind();
               top250.init();
               usbox.init();
               search.init();
           },
           bind:function(){
               var _this = this;
               this.$tabs.on('click',function(){
                   $(this).addClass('active').siblings().removeClass('active');
                   _this.$panel.eq($(this).index()).fadeIn().siblings().hide();
               })
           }
       }
       app.init();

  