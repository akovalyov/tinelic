define(['tinybone/base', 'lodash',"tinybone/backadapter","safe", 'dustc!templates/pages.dust', 'highcharts'],function (tb,_,api, safe) {
    var view = tb.View;
    var View = view.extend({
        id:"templates/pages",
        events: {
            'click .do-stats': function(e) {
                var self = this;
                $this = $(e.currentTarget);
                var h = window.location.pathname.split('/',5)
                this.app.router.navigateTo('/'+h[1]+'/'+h[2]+'/'+h[3]+"/"+h[4]+'/'+$this.data('sort'));
                return false;
            },
            'click .more': function(e) {
                var self = this;
                var trbreak = self.$('#trbreak')
                var p = $(e.currentTarget).html()
                var filter = this.data.fr
                filter.filter._s_route = p;

                safe.parallel([
                    function(cb) {
                        api("stats.pagesBreakDown", $.cookie("token"), filter, safe.sure(cb, function(data) {
                            trbreak.empty();
                            trbreak.append('<tr class=\"info\"><th>Part</th><th>Count</th><th>Time</th></tr>');
                            var sum = 0;
                            _.forEach(data, function(r){
                                r.value.r = r.value.r.toFixed(2)
                                sum += r.value.tta
                            })
                            _.forEach(_.sortBy(data,function(r){return -1*r.value.tta}), function(data) {
                                trbreak.append('<tr><td>'+data._id+'</td><td>'+data.value.r+'</td><td>'+((data.value.tta/sum)*100).toFixed(2)+' %</td></tr>')
                            })
                        }))
                        cb()
                    },
                    function(cb) {
                        api("stats.getPageViews", $.cookie("token"), filter, safe.sure(cb, function(data) {

                            var views = data;
                            var flat = [], prev = null
                            var quant = filter.quant;
                            var offset = new Date().getTimezoneOffset();
                            _.each(views, function (a) {
                                if (prev) {
                                    for (var i = prev._id + 1; i < a._id; i++) {
                                        flat.push({_id: i, value: null});
                                    }
                                }
                                prev = a;
                                flat.push(a);
                            })

                            var rpm1;
                            var rpm = [];
                            var ttBrowser = [];
                            _.each(flat, function (v) {
                                var apdex = v.value ? v.value.apdex : null
                                if (isFinite(apdex) == false) {
                                    apdex = null;
                                }
                                var d = new Date(v._id * quant * 60000);
                                d.setMinutes(d.getMinutes() - offset);
                                d = d.valueOf();
                                var rpm1 = v.value ? v.value.r : 0;
                                rpm.push([d, rpm1]);
                                ttBrowser.push([d, v.value?(v.value.tta/1000):0]);
                            })

                            var rpmmax = _.max(rpm, function (v) {
                                return v[1];
                            })[1];
                            var ttBrowserMax = _.max(ttBrowser, function (v) { return v[1]; })[1];

                            self.$('#rpm-one').highcharts({
                                chart: {
                                    type: 'spline',
                                    zoomType: 'x'
                                },
                                title: {
                                    text: ''
                                },
                                xAxis: {
                                    type: 'datetime'
                                },
                                yAxis: [{
                                    title: {
                                        text: 'Throughput (rpm)'
                                    },
                                    min: 0,
                                    max: rpmmax
                                }
                                ],
                                plotOptions: {
                                    series: {
                                        marker: {
                                            enabled: false
                                        },
                                        animation: false
                                    }
                                },
                                legend: {
                                    enabled: false
                                },
                                credits: {
										enabled: false
								},
                                series: [
                                    {
                                        name: 'rpm',
                                        yAxis: 0,
                                        data: rpm,
                                        color: "green",
                                        type: 'area',
                                        fillColor: {
                                            linearGradient: {
                                                x1: 0,
                                                y1: 0,
                                                x2: 0,
                                                y2: 1
                                            },
                                            stops: [
                                                [0, 'lightgreen'],
                                                [1, 'white']
                                            ]
                                        }
                                    }
                                ]
                            })
                            self.$('#time-one').highcharts({
                                chart: {
                                    type: 'spline',
                                    zoomType: 'x'
                                },
                                title: {
                                    text: ''
                                },
                                xAxis: {
                                    type: 'datetime'
                                },
                                yAxis: [{
                                    title: {
                                        text: 'Timing (s)'
                                    },
                                    min: 0,
                                    max: ttBrowserMax
                                }
                                ],
                                plotOptions: {
                                    series: {
                                        marker: {
                                            enabled: false
                                        },
                                        animation: false
                                    }
                                },
                                legend: {
                                    enabled: false
                                },
                                credits: {
										enabled: false
								},
                                series: [
                                    {
                                        name: 'rpm',
                                        yAxis: 0,
                                        data: ttBrowser,
                                        color: "blue",
                                        type: 'area',
                                        fillColor: {
                                            linearGradient: {
                                                x1: 0,
                                                y1: 0,
                                                x2: 0,
                                                y2: 1
                                            },
                                            stops: [
                                                [0, 'lightblue'],
                                                [1, 'white']
                                            ]
                                        }
                                    }
                                ]
                            })
                        }))
                        cb()
                    }
                ])
            }
        },
        postRender:function () {
            view.prototype.postRender.call(this);
            var filter1 = this.data.fr;
			api("stats.getPageViews", $.cookie("token"), this.data.fr, safe.sure(this.app.errHandler, function(data) {

                            var views = data;
                            var flat = [], prev = null
                            var quant = filter1.quant;
                            var offset = new Date().getTimezoneOffset();
                            for (var i = filter1.filter._dt.$gt/(quant*60000); i < views[0]._id; i++){
								flat.push({_id: i, value: null});
							}
                            _.each(views, function (a) {
                                if (prev) {
                                    for (var i = prev._id + 1; i < a._id; i++) {
                                        flat.push({_id: i, value: null});
                                    }
                                }
                                prev = a;
                                flat.push(a);
                            })
							for (var i = views[views.length-1]._id; i < filter1.filter._dt.$lte/(quant*60000); i++){
								flat.push({_id: i+1, value: null});
							}

                            var rpm1;
                            var rpm = [];
                            var ttBrowser = [];
                            _.each(flat, function (v) {
                                var apdex = v.value ? v.value.apdex : null
                                if (isFinite(apdex) == false) {
                                    apdex = null;
                                }
                                var d = new Date(v._id * quant * 60000);
                                d.setMinutes(d.getMinutes() - offset);
                                d = d.valueOf();
                                var rpm1 = v.value ? v.value.r : 0;
                                rpm.push([d, rpm1]);
                                ttBrowser.push([d, v.value?(v.value.tta/1000):0]);
                            })

                            var rpmmax = _.max(rpm, function (v) {
                                return v[1];
                            })[1];
                            var ttBrowserMax = _.max(ttBrowser, function (v) { return v[1]; })[1];

                            self.$('#rpm-one').highcharts({
                                chart: {
                                    type: 'spline',
                                    zoomType: 'x'
                                },
                                title: {
                                    text: ''
                                },
                                xAxis: {
                                    type: 'datetime'
                                },
                                yAxis: [{
                                    title: {
                                        text: 'Throughput (rpm)'
                                    },
                                    min: 0,
                                    max: rpmmax
                                }
                                ],
                                plotOptions: {
                                    series: {
                                        marker: {
                                            enabled: false
                                        },
                                        animation: false
                                    }
                                },
                                legend: {
                                    enabled: false
                                },
                                credits: {
										enabled: false
								},
                                series: [
                                    {
                                        name: 'rpm',
                                        yAxis: 0,
                                        data: rpm,
                                        color: "green",
                                        type: 'area',
                                        fillColor: {
                                            linearGradient: {
                                                x1: 0,
                                                y1: 0,
                                                x2: 0,
                                                y2: 1
                                            },
                                            stops: [
                                                [0, 'lightgreen'],
                                                [1, 'white']
                                            ]
                                        }
                                    }
                                ]
                            })
                            self.$('#time-one').highcharts({
                                chart: {
                                    type: 'spline',
                                    zoomType: 'x'
                                },
                                title: {
                                    text: ''
                                },
                                xAxis: {
                                    type: 'datetime'
                                },
                                yAxis: [{
                                    title: {
                                        text: 'Timing (s)'
                                    },
                                    min: 0,
                                    max: ttBrowserMax
                                }
                                ],
                                plotOptions: {
                                    series: {
                                        marker: {
                                            enabled: false
                                        },
                                        animation: false
                                    }
                                },
                                legend: {
                                    enabled: false
                                },
                                credits: {
										enabled: false
								},
                                series: [
                                    {
                                        name: 'rpm',
                                        yAxis: 0,
                                        data: ttBrowser,
                                        color: "blue",
                                        type: 'area',
                                        fillColor: {
                                            linearGradient: {
                                                x1: 0,
                                                y1: 0,
                                                x2: 0,
                                                y2: 1
                                            },
                                            stops: [
                                                [0, 'lightblue'],
                                                [1, 'white']
                                            ]
                                        }
                                    }
                                ]
                            })
                        }))
        }
    })
    View.id = "views/pages_view";
    return View;
})
