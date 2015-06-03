define(['tinybone/base','tinybone/backadapter','bootstrap/modal','dustc!views/users/usersedit.dust'],function (tb,api) {
	var view = tb.View;
	var View = view.extend({
		id:"views/users/usersedit",
        postRender:function () {
            view.prototype.postRender.call(this);
            this.$('.modal').modal({});
        },
        events:{
            'click .do-cancel, click .do-close': function(e) {
                this.trigger('cancel');
                this.remove();
            },
            'click .do-save': function(e) {
                var self = this;
                var fname = self.$('#firstname')[0].value;
                var lname = self.$('#lastname')[0].value;
                var login = self.$('#login')[0].value;
                var role = self.$('.btn-info')[0].innerHTML;
                var pass = self.$('#userpass')[0].value;
                var rpass = self.$('#userrpass')[0].value;
                var id = self.$('#_id')[0].value;
                var warn = self.$('#warn');
                var modal = self.$('#settings');

                if (role == "Role is not checked") {
                    warn.html('Role is not checked')
                }
                else {
                    if (pass.length < 3 || lname.length < 3 || fname.length < 3 || login.length < 3) {
                        warn.html('Name or password or login is to short')
                    }
                    else {
                        if ((pass != rpass) || (!pass)) {
                            warn.html('Password does not match')
                        }
                        else {
							var data = {login:login, firstname:fname, lastname:lname, role:role, pass:pass};
							var func = "";
                            if (id.length != 0) {
								func = "users.updateUser";
								data.id = id;
                            }
                            else
								func = "users.saveUser";
                            api(func, "public", data, function(err) {
								if (err)
									warn.html(err.toString());
								else {
									self.trigger('saved');
									self.remove();
								}
							});
                        }
                    }
                }
                return false;
            }
        },
        remove: function () {
			self.$('.modal').modal('hide');
			return view.prototype.remove.call(this);
		},
	});
	View.id = "views/users/usersedit";
	return View;
});