var ArduinoTemplate = "";
var ArduinoI2CTemplate = "";
var numCharacters = 1;

function binaryToHex(s) {
    var i, k, part, accum, ret = '';
    for (i = s.length-1; i >= 3; i -= 4) {
        // extract out in substrings of 4 and convert to hex
        part = s.substr(i+1-4, 4);
        accum = 0;
        for (k = 0; k < 4; k += 1) {
            if (part[k] !== '0' && part[k] !== '1') {
                // invalid character
                return { valid: false };
            }
            // compute the length 4 substring
            accum = accum * 2 + parseInt(part[k], 10);
        }
        if (accum >= 10) {
            // 'A' to 'F'
            ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
        } else {
            // '0' to '9'
            ret = String(accum) + ret;
        }
    }
    // remaining characters, i = 0, 1, or 2
    if (i >= 0) {
        accum = 0;
        // convert from front
        for (k = 0; k <= i; k += 1) {
            if (s[k] !== '0' && s[k] !== '1') {
                return { valid: false };
            }
            accum = accum * 2 + parseInt(s[k], 10);
        }
        // 3 bits, value cannot exceed 2^3 - 1 = 7, just convert
        ret = String(accum) + ret;
    }
    return { valid: true, result: ret };
}
reloadCode = function() {
    ArduinoTemplate = "";
    ArduinoTemplate += "#include &lt;LiquidCrystal.h&gt;\n";
    ArduinoTemplate += "\n";
    ArduinoTemplate += "LiquidCrystal lcd(12, 11, 5, 4, 3, 2); // RS, E, D4, D5, D6, D7\n";
    ArduinoTemplate += "\n";
    
    for(var i = 0; i < numCharacters; i++){
        ArduinoTemplate += "byte customChar" + i + "[] = {\n";
        ArduinoTemplate += "  {DataX" + i + "0},";
        ArduinoTemplate += "  {DataX" + i + "1},";
        ArduinoTemplate += "  {DataX" + i + "2},";
        ArduinoTemplate += "  {DataX" + i + "3},\n";
        ArduinoTemplate += "  {DataX" + i + "4},";
        ArduinoTemplate += "  {DataX" + i + "5},";
        ArduinoTemplate += "  {DataX" + i + "6},";
        ArduinoTemplate += "  {DataX" + i + "7}\n";
        ArduinoTemplate += "};\n";
    }
    ArduinoTemplate += "void setup() {\n";
    ArduinoTemplate += "  lcd.begin(16, 2);\n";
    ArduinoTemplate += "  lcd.createChar(0, customChar);\n";
    ArduinoTemplate += "  lcd.home();\n";
    ArduinoTemplate += "  lcd.write(0);\n";
    ArduinoTemplate += "}\n";
    ArduinoTemplate += "\n";
    ArduinoTemplate += "void loop() { }";  
    
    
    ArduinoI2CTemplate = "";
    ArduinoI2CTemplate += "#include &lt;Wire.h&gt;\n";
    ArduinoI2CTemplate += "#include &lt;LiquidCrystal_I2C.h&gt;\n";
    ArduinoI2CTemplate += "\n";
    ArduinoI2CTemplate += "// Set the LCD address to 0x27 in PCF8574 by NXP \n"
    ArduinoI2CTemplate += "and Set to 0x3F in PCF8574A by Ti\n";
    ArduinoI2CTemplate += "LiquidCrystal_I2C lcd(0x3F, 16, 2);\n";
    ArduinoI2CTemplate += "\n";
    for(var i = 0; i < numCharacters; i++){
        ArduinoI2CTemplate += "byte customChar" + i + "[] = {\n";
        ArduinoI2CTemplate += "  {DataX" + i + "0},";
        ArduinoI2CTemplate += "  {DataX" + i + "1},";
        ArduinoI2CTemplate += "  {DataX" + i + "2},";
        ArduinoI2CTemplate += "  {DataX" + i + "3},\n";
        ArduinoI2CTemplate += "  {DataX" + i + "4},";
        ArduinoI2CTemplate += "  {DataX" + i + "5},";
        ArduinoI2CTemplate += "  {DataX" + i + "6},";
        ArduinoI2CTemplate += "  {DataX" + i + "7}\n";
        ArduinoI2CTemplate += "};\n";
    }
    ArduinoI2CTemplate += "void setup() {\n";
    ArduinoI2CTemplate += "  lcd.begin();\n";
    ArduinoI2CTemplate += "  lcd.createChar(0, customChar);\n";
    ArduinoI2CTemplate += "  lcd.home();\n";
    ArduinoI2CTemplate += "  lcd.write(0);\n";
    ArduinoI2CTemplate += "}\n";
    ArduinoI2CTemplate += "\n";
    ArduinoI2CTemplate += "void loop() { }";    
}

reloadData = function() {
	$("[name='datatype']").each(function(index, element) {
        if ($(this).is(":checked")) type = $(this).val();
    });

    var Data = [[],[],[],[],[],[],[],[]];

    var myChars = document.getElementsByClassName("box-char");
    for( var c = 0; c < myChars.length; c++){
        var col = myChars[c].getElementsByClassName("col")

        for (var x = 0 ; x < col.length; x ++){
            var pix = col[x].getElementsByClassName("dot-px");
            var BinStr="";
            for(var y = 0; y < pix.length; y++){
                if( $(pix[y]).attr("class").indexOf("high") >= 0){
                    BinStr += "1";
                }else{
                    BinStr += "0";
                }
            }
            Data[c][x] = type == "hex" ? "0x" + binaryToHex(BinStr)['result'] : "B" + BinStr;
        }       
    }
	
	var interfacing;
	$("[name='interfacing']").each(function(index, element) {
        if ($(this).is(":checked")) interfacing = $(this).val();
    });
	var html= interfacing == "parallel" ? ArduinoTemplate : ArduinoI2CTemplate;
    for(var x = 0; x < 8; x++){
        for (var i=0;i<=7;i++) {
            html = html.replace("{DataX" + x + i + "}", Data[x][i]);
        }        
    }
	$("#code-box").html(html);
	Prism.highlightAll();
}

$(document).ready(function(e) {
    $(".dot-px").click(function(e) {
        if ($(this).attr("class").indexOf("high")>=0) {
          $(this).removeClass("high");
		} else {
          $(this).addClass("high");
        }
		reloadData();
    });
	
	$("[name='color']").change(function(e) {
        $(".box-char").removeClass("green").removeClass("blue").addClass($(this).val());
    });

	$("[name='structure']").change(function(e) {
        var divRow = document.getElementsByClassName("row")[0];
        $(".box-char").removeClass("box-char-invis");
        numCharacters = 8;

        switch($(this).val()){
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
                numCharacters = $(this).val();
                divRow.className = "row row1x" + $(this).val();
                for(var i = $(this).val(); i < 8; i++){
                    $("." + i).addClass("box-char-invis");
                }
                break;
            case "9": // 2x2
                numCharacters = 4;
                divRow.className = "row row2x2";
                for(var i = numCharacters; i < 8; i++){
                    $("." + i).addClass("box-char-invis");  
                }                
                break;
             case "10": // 2x2
                numCharacters = 6;
                divRow.className = "row row3x2";
                for(var i = numCharacters; i < 8; i++){
                    $("." + i).addClass("box-char-invis");  
                }                
                break;
            case "11": // 2x4
                divRow.className = "row row2x4";
                break;
            case "12": // 4x2
                divRow.className = "row row4x2";
                break;
        }
           
        reloadCode();
        reloadData();
    });
        
	$("[name='datatype'], [name='interfacing']").change(function(e) {
        reloadData();
    });
	
	$("#clear").click(function(e) {
		for (var x=0;x<=7;x++) {
			for (var y=0;y<=4;y++) {
				$(".dot-px[data-x='" + x + "'][data-y='" + y + "']").removeClass("high");
			}
		}
        reloadData();;
    });
	
	$("#invert").click(function(e) {
        var myChars = document.getElementsByClassName("box-char");
        for( var c = 0; c < myChars.length; c++){
            var col = myChars[c].getElementsByClassName("col")

            for (var x = 0 ; x < col.length; x ++){
                var pix = col[x].getElementsByClassName("dot-px");
                for(var y = 0; y < pix.length; y++){
                    if( $(pix[y]).attr("class").indexOf("high") >= 0){
                        $(pix[y]).removeClass("high");
                    }else{
                        $(pix[y]).addClass("high");
                    }
                }
            }       
        }

        reloadData();;
    });
	
    $("[name='structure']").change();
    reloadCode();
	reloadData();
});