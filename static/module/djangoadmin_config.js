// +----------------------------------------------------------------------
// | DjangoAdmin敏捷开发框架 [ 赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | 版权所有 2021~2023 北京DjangoAdmin研发中心
// +----------------------------------------------------------------------
// | Licensed LGPL-3.0 DjangoAdmin并不是自由软件，未经许可禁止去掉相关版权
// +----------------------------------------------------------------------
// | 官方网站: https://www.djangoadmin.cn
// +----------------------------------------------------------------------
// | Author: @一米阳光 团队荣誉出品
// +----------------------------------------------------------------------
// | 版权和免责声明:
// | 本团队对该软件框架产品拥有知识产权（包括但不限于商标权、专利权、著作权、商业秘密等）
// | 均受到相关法律法规的保护，任何个人、组织和单位不得在未经本团队书面授权的情况下对所授权
// | 软件框架产品本身申请相关的知识产权，禁止用于任何违法、侵害他人合法权益等恶意的行为，禁
// | 止用于任何违反我国法律法规的一切项目研发，任何个人、组织和单位用于项目研发而产生的任何
// | 意外、疏忽、合约毁坏、诽谤、版权或知识产权侵犯及其造成的损失 (包括但不限于直接、间接、
// | 附带或衍生的损失等)，本团队不承担任何法律责任，本软件框架禁止任何单位和个人、组织用于
// | 任何违法、侵害他人合法利益等恶意的行为，如有发现违规、违法的犯罪行为，本团队将无条件配
// | 合公安机关调查取证同时保留一切以法律手段起诉的权利，本软件框架只能用于公司和个人内部的
// | 法律所允许的合法合规的软件产品研发，详细声明内容请阅读《框架免责声明》附件；
// +----------------------------------------------------------------------

/**
 * 配置管理
 * @author 一米阳光
 * @since 2021/7/26
 */
layui.use(['layer', 'form', 'table', 'util', 'admin', 'func'], function () {
    var $ = layui.jquery;
    var layer = layui.layer;
    var form = layui.form;
    var table = layui.table;
    var util = layui.util;
    var admin = layui.admin;
    var func = layui.func;
    var selObj;  // 左表选中数据

    form.on('submit(configDataEditSubmit)', function (data) {
        console.log("1111")
    });

    /* 渲染表格 */
    var insTb = table.render({
        elem: '#configTable',
        url: '/config/list',
        height: 'full-100',
        method: 'get',
        toolbar: ['<p>',
            '<button lay-event="add" class="layui-btn layui-btn-sm icon-btn"><i class="layui-icon">&#xe654;</i>添加</button>&nbsp;',
            '<button lay-event="edit" class="layui-btn layui-btn-sm layui-btn-warm icon-btn"><i class="layui-icon">&#xe642;</i>修改</button>&nbsp;',
            '<button lay-event="del" class="layui-btn layui-btn-sm layui-btn-danger icon-btn"><i class="layui-icon">&#xe640;</i>删除</button>',
            '</p>'].join(''),
        defaultToolbar: [],
        cols: [[
            {field: 'id', width: 80, title: 'ID', align: 'center'}
            , {field: 'name', title: '配置名称'}
        ]],
        done: function (res, curr, count) {
            $('#configTable+.layui-table-view .layui-table-body tbody>tr:first').trigger('click');
        }
    });

    /* 表格搜索 */
    form.on('submit(configTbSearch)', function (data) {
        insTb.reload({where: data.field});
        return false;
    });

    /* 表格头工具栏点击事件 */
    table.on('toolbar(configTable)', function (obj) {
        if (obj.event === 'add') { // 添加
            showEditModel();
        } else if (obj.event === 'edit') { // 修改
            showEditModel(selObj.data, selObj);
        } else if (obj.event === 'del') { // 删除
            doDel(selObj);
        }
    });

    /* 监听行单击事件 */
    table.on('row(configTable)', function (obj) {
        selObj = obj;
        obj.tr.addClass('layui-table-click').siblings().removeClass('layui-table-click');
        insTb2.reload({where: {config_id: obj.data.id}, page: {curr: 1}, url: '/configdata/list'});
    });

    /* 显示表单弹窗 */
    function showEditModel(mData, obj) {
        admin.open({
            type: 1,
            title: (mData ? '修改' : '添加') + '配置',
            content: $('#configEditDialog').html(),
            success: function (layero, dIndex) {
                // 回显表单数据
                form.val('configEditForm', mData);
                // 表单提交事件
                form.on('submit(configEditSubmit)', function (data) {
                    var loadIndex = layer.load(2);
                    $.post(mData ? '/config/update' : '/config/add', data.field, function (res) {
                        layer.close(loadIndex);
                        if (0 === res.code) {
                            layer.close(dIndex);
                            layer.msg(res.msg, {icon: 1});
                            if (obj) {
                                obj.update(data.field);
                            } else {
                                insTb.reload();
                            }
                        } else {
                            layer.msg(res.msg, {icon: 2});
                        }
                    }, 'json');
                    return false;
                });
            }
        });
    }

    /* 删除 */
    function doDel(obj) {
        layer.confirm('确定要删除此配置吗？', {
            skin: 'layui-layer-admin',
            shade: .1
        }, function (i) {
            layer.close(i);
            // var loadIndex = layer.load(2);
            // $.delete('/config/delete/'+ obj.data.id, {}, function (res) {
            //     layer.close(loadIndex);
            //     if (0 === res.code) {
            //         layer.msg(res.msg, {icon: 1});
            //         obj.del();
            //         $('#configTable+.layui-table-view .layui-table-body tbody>tr:first').trigger('click');
            //     } else {
            //         layer.msg(res.msg, {icon: 2});
            //     }
            // }, 'json');

            // 网络请求删除数据
            var index = null;
            $.ajax({
                type: "delete",
                url: '/config/delete/'+ obj.data.id,
                data: {},
                dataType: "json",
                contentType: false,
                processData: false,
                beforeSend: function () {
                    index = layer.msg("处理中,请稍后...", {
                        icon: 16
                        , shade: 0.01
                        , time: 0
                    });
                },
                success: function (res) {
                    if (res.code == 0) {
                        //0.5秒后关闭
                        layer.msg(res.msg, {icon: 1, time: 500}, function () {
                            layer.close(index);
                            obj.del();
                            $('#dictTable+.layui-table-view .layui-table-body tbody>tr:first').trigger('click');
                        });
                    } else {
                        layer.close(index);
                        layer.msg(res.msg, {icon: 5});
                        return false;
                    }
                },
                error: function () {
                    layer.close(index);
                    layer.msg("AJAX请求异常", {icon: 2});
                }
            });

        });
    }

    /* 渲染表格2 */
    var insTb2 = table.render({
        elem: '#configDataTable',
        data: [],
        height: 'full-100',
        method: 'get',
        page: true,
        toolbar: ['<p>',
            '<button lay-event="add" class="layui-btn layui-btn-sm icon-btn"><i class="layui-icon">&#xe654;</i>添加</button>&nbsp;',
            '<button lay-event="del" class="layui-btn layui-btn-sm layui-btn-danger icon-btn"><i class="layui-icon">&#xe640;</i>删除</button>&nbsp;',
            '</p>'].join(''),
        cellMinWidth: 100,
        cols: [[
            {type: 'checkbox', fixed: 'left'}
            , {field: 'id', width: 80, title: 'ID', align: 'center', sort: true, fixed: 'left'}
            , {field: 'title', width: 150, title: '配置标题', align: 'center'}
            , {field: 'code', width: 150, title: '配置标签符', align: 'center'}
            , {field: 'type', width: 100, title: '配置类型', align: 'center', templet(d) {
                    var cls = "";
                    return '<span class="layui-btn ' + cls + ' layui-btn-xs">' + d.type_name + '</span>';
                }
            }
            , {field: 'value', width: 150, title: '配置值', align: 'center'}
            , {field: 'options', width: 100, title: '配置项', align: 'center'}
            , {field: 'status', width: 100, title: '状态', align: 'center', templet: function (d) {
                return  '<input type="checkbox" name="status" value="' + d.id + '" lay-skin="switch" lay-text="正常|禁用" lay-filter="status" '+(d.status==1 ? 'checked' : '')+'>';
            }}
            , {field: 'sort', width: 100, title: '排序号', align: 'center'}
            , {field: 'note', width: 100, title: '配置说明', align: 'center'}
            , {field: 'create_time', width: 180, title: '添加时间', align: 'center', templet:"<div>{{layui.util.toDateString(d.create_time*1000, 'yyyy-MM-dd HH:mm:ss')}}</div>"}
            , {field: 'update_time', width: 180, title: '更新时间', align: 'center', templet:"<div>{{layui.util.toDateString(d.update_time*1000, 'yyyy-MM-dd HH:mm:ss')}}</div>"}
            , {title: '操作', toolbar: '#configDataTbBar', align: 'center', width: 120, minWidth: 120, fixed: 'right'}
        ]]
    });

    /* 表格2搜索 */
    form.on('submit(configDataTbSearch)', function (data) {
        insTb2.reload({where: data.field, page: {curr: 1}});
        return false;
    });

    /* 表格2工具条点击事件 */
    table.on('tool(configDataTable)', function (obj) {
        if (obj.event === 'edit') { // 修改
            showEditModel2(obj.data);
        } else if (obj.event === 'del') { // 删除
            doDel2(obj);
        }
    });

    /* 表格2头工具栏点击事件 */
    table.on('toolbar(configDataTable)', function (obj) {
        if (obj.event === 'add') { // 添加
            showEditModel2();
        } else if (obj.event === 'del') { // 删除
            var checkRows = table.checkStatus('configDataTable');
            if (checkRows.data.length === 0) {
                layer.msg('请选择要删除的数据', {icon: 2});
                return;
            }
            var ids = checkRows.data.map(function (d) {
                return d.id;
            });
            doDel2({ids: ids});
        }
    });

    /* 显示表单弹窗2 */
    function showEditModel2(mData) {
        admin.open({
            type: 1,
            title: (mData ? '修改' : '添加') + '配置项',
            content: $('#configDataEditDialog').html(),
            area: ['750px', '530px'],
            success: function (layero, dIndex) {
                // 回显表单数据
                form.val('configDataEditForm', mData);
                // 表单提交事件
                form.on('submit(configDataEditSubmit)', function (data) {
                    data.field.config_id = selObj.data.id;
                    var loadIndex = layer.load(2);
                    $.post(mData ? '/configdata/update' : '/configdata/add', data.field, function (res) {
                        layer.close(loadIndex);
                        if (0 === res.code) {
                            layer.close(dIndex);
                            layer.msg(res.msg, {icon: 1});
                            insTb2.reload({page: {curr: 1}});
                        } else {
                            layer.msg(res.msg, {icon: 2});
                        }
                    }, 'json');
                    return false;
                });
            }
        });
    }

    /* 删除2 */
    function doDel2(obj) {
        layer.confirm('确定要删除选中数据吗？', {
            skin: 'layui-layer-admin',
            shade: .1
        }, function (i) {
            layer.close(i);
            // var loadIndex = layer.load(2);
            var ids = []
            if (obj.data) {
                ids = [obj.data.id]
            } else if (obj.ids) {
                ids = obj.ids;
            }
            // $.delete('/configdata/delete/' +ids.join(",") , {}, function (res) {
            //     layer.close(loadIndex);
            //     if (0 === res.code) {
            //         layer.msg(res.msg, {icon: 1});
            //         insTb2.reload({page: {curr: 1}});
            //     } else {
            //         layer.msg(res.msg, {icon: 2});
            //     }
            // }, 'json');

            // 网络请求删除数据
            var index = null;
            $.ajax({
                type: "delete",
                url: '/configdata/delete/' +ids.join(","),
                data: {},
                dataType: "json",
                contentType: false,
                processData: false,
                beforeSend: function () {
                    index = layer.msg("处理中,请稍后...", {
                        icon: 16
                        , shade: 0.01
                        , time: 0
                    });
                },
                success: function (res) {
                    if (res.code == 0) {
                        //0.5秒后关闭
                        layer.msg(res.msg, {icon: 1, time: 500}, function () {
                            layer.close(index);
                            // 刷新数据
                            insTb2.reload({page: {curr: 1}});
                        });
                    } else {
                        layer.close(index);
                        layer.msg(res.msg, {icon: 5});
                        return false;
                    }
                },
                error: function () {
                    layer.close(index);
                    layer.msg("AJAX请求异常", {icon: 2});
                }
            });
        });
    }

    //【设置状态】
    func.formSwitch('status', "/configdata/status", function (data, res) {
        console.log("开关回调成功");
    });

});
