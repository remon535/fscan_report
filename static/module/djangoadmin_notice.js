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
 * 通知公告
 * @author 一米阳光
 * @since 2021/7/26
 */
layui.use(['func'], function () {

    //声明变量
    var func = layui.func
        , form = layui.form
        , $ = layui.$;

    if (A == 'index') {
        //【TABLE列数组】
        var cols = [
              {type: 'checkbox', fixed: 'left'}
            , {field: 'id', width: 80, title: 'ID', align: 'center', sort: true, fixed: 'left'}
            , {field: 'title', width: 300, title: '通知标题', align: 'center'}
            , {field: 'source', width: 100, title: '通知来源', align: 'center', templet(d) {
                var cls = "";
                if (d.source == 1) {
                    cls = "layui-btn-normal";
                } else if (d.source == 2) {
                    cls = "layui-btn-primary"
                }
				return '<span class="layui-btn ' + cls + ' layui-btn-xs">'+d.source_name+'</span>';
            }}
            , {field: 'url', width: 200, title: '外部链接', align: 'center'}
            , {field: 'is_top', width: 100, title: '是否置顶', align: 'center', templet(d) {
                if (d.is_top == 1) {
                    // 已置顶
                    return '<span class="layui-btn layui-btn-primary layui-btn-xs">已置顶</span>';
                } else if (d.is_top == 2) {
                    // 未置顶
                    return '<span class="layui-btn layui-btn-danger layui-btn-xs">未置顶</span>';
                }
            }}
            , {field: 'status', width: 100, title: '发布状态', align: 'center', templet(d) {
                if (d.status == 1) {
                    // 草稿箱
                    return '<span class="layui-btn layui-btn-normal layui-btn-xs">在用</span>';
                } else if (d.status == 2) {
                    // 立即发布
                    return '<span class="layui-btn layui-btn-danger layui-btn-xs">停用</span>';
                }
            }}
            , {field: 'click', width: 100, title: '点击率', align: 'center'}
            , {field: 'create_time', width: 180, title: '添加时间', align: 'center', templet:"<div>{{layui.util.toDateString(d.create_time*1000, 'yyyy-MM-dd HH:mm:ss')}}</div>"}
            , {field: 'update_time', width: 180, title: '更新时间', align: 'center', templet:"<div>{{layui.util.toDateString(d.update_time*1000, 'yyyy-MM-dd HH:mm:ss')}}</div>"}
            , {fixed: 'right', width: 150, title: '功能操作', align: 'center', toolbar: '#toolBar'}
        ];

        //【渲染TABLE】
        func.tableIns(cols, "tableList");

        //【设置弹框】
        func.setWin("通知公告");

        //【设置状态】
        func.formSwitch('status', null, function (data, res) {
            console.log("开关回调成功");
        });
    }
});
