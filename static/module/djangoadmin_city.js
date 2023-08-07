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
 * 城市管理
 * @author 一米阳光
 * @since 2021/7/26
 */
layui.use(['func'], function () {

    //声明变量
    var func = layui.func
        , $ = layui.$;

    if (A == 'index') {
        //【TABLE列数组】
        var cols = [
              {field: 'id', width: 80, title: 'ID', align: 'center', sort: true}
            , {field: 'name', width: 200, title: '城市名称', align: 'left'}
            , {field: 'area_code', width: 150, title: '城市区号', align: 'center'}
            , {field: 'area_code', width: 150, title: '行政编码', align: 'center'}
            , {field: 'parent_code', width: 150, title: '父级编码', align: 'center'}
            , {field: 'level', width: 100, title: '城市级别', align: 'center', templet(d) {
                var cls = "";
                if (d.level == 1) {
                    // 省份
                    cls = "layui-btn-normal";
                } else if (d.level == 2) {
                    // 市区
                    cls = "layui-btn-danger";
                } else if (d.level == 3) {
                    // 区县
                    cls = "layui-btn-warm";
                } else if (d.platform == 4) {
                    // 街道
                    cls = "layui-btn-primary";
                }
				return '<span class="layui-btn ' + cls + ' layui-btn-xs">'+d.level_name+'</span>';
            }}
            , {field: 'zip_code', width: 100, title: '邮政编码', align: 'center'}
            , {field: 'short_name', width: 200, title: '城市简称', align: 'center'}
            , {field: 'pinyin', width: 150, title: '城市拼音', align: 'center'}
            , {field: 'create_time', width: 180, title: '添加时间', align: 'center', templet:"<div>{{layui.util.toDateString(d.create_time*1000, 'yyyy-MM-dd HH:mm:ss')}}</div>"}
            , {field: 'update_time', width: 180, title: '更新时间', align: 'center', templet:"<div>{{layui.util.toDateString(d.update_time*1000, 'yyyy-MM-dd HH:mm:ss')}}</div>"}
            , {width: 230, title: '功能操作', align: 'left', toolbar: '#toolBar'}
        ];

        //【渲染TABLE】
        func.treetable(cols, "tableList");

        //【设置弹框】
        func.setWin("城市",750, 450);

    }
});
