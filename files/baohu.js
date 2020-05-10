document.onkeydown=function(){
    var e = window.event||arguments[0];
    if(e.keyCode==123){
    	alert('感谢您支持Aaron Repo');
            return false;
    }else if((e.ctrlKey)&&(e.shiftKey)&&(e.keyCode==73)){
    	alert('感谢您支持Aaron Repo');
            return false;
    }else if((e.ctrlKey)&&(e.keyCode==85)){
            alert('感谢您支持Aaron Repo');
            return false;
    }else if((e.ctrlKey)&&(e.keyCode==83)){
           alert('感谢您支持Aaron Repo');
           return false;
    }
}
document.oncontextmenu=function(){
	alert('感谢您支持Aaron Repo');
    return false;
}
try {
	if (window.console && window.console.log) {
		console.log("%c哟，高人您好,祝您扒代码愉快~！","color:red");
		console.log("有问题,请留言：admin@aaronc.cn");
	};
} catch (e) {};
