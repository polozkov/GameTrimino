var PAIR = PAIR;
var STAT = STAT;
var window = window;
//холст рисования всего для нашей игры
var main_canvas = window.document.getElementById('id_canvas');
//общий контекст для рисования
var main_ctx = main_canvas.getContext('2d');

//графические примитивы и настройки контекста рисования
var DRAW = {

    //настройки пера и кисти для всех контекстов
    CTX: {
        //контекст для рисования заднего фона
        back_ground: ["rgba(200, 200, 200, 1)", "rgba(255, 0, 0, 1)", 1],

        //контекст для рисования панели
        PANEL: {
            //контекст для рисования сетки панели
            grid: ["rgba(196, 255, 196, 1)", "rgba(0, 0, 0, 1)", 1],

            //выбранный режим игры
            selected_game_mode: ["rgba(100, 255, 100, 1)", "rgba(0, 0, 0, 1)", 1]
        },

        //контекст для рисования доски
        BOARD: {
            //контекст для рисования полей доски
            cells: ["rgba(235, 255, 235, 1)", "rgba(0, 0, 0, 1)", 1],

            //задний фон доски
            back: ["rgba(50, 150, 50, 1)", "rgba(0, 0, 0, 1)", 1],

            //контекст для мячей на поле: все одного цвета без обводки
            ball: ["rgba(0, 0, 0, 1)", "rgba(0, 0, 0, 1)", 0]
        },

        //дассивы для контекстов, специальных для каждого игрока
        ARR: {
            //новая фигура тримино
            new_fig: [undefined,
                    ["rgba(220, 0, 0, 1)", "rgba(0, 0, 0, 1)", 0],
                    ["rgba(0, 0, 220, 1)", "rgba(0, 0, 0, 1)", 0]],
            
            //отмечаем ходы на доске (подсказки: маленькие фигуры тримино)
            moves: [undefined,
                    ["rgba(220, 0, 0, 1)", "rgba(0, 0, 0, 1)", 0],
                    ["rgba(0, 0, 220, 1)", "rgba(0, 0, 0, 1)", 0]],

            //отмечаем запасы обоих игроков на панели (счёт)
            score: [undefined,
                    ["rgba(255, 120, 120, 1)", "rgba(0, 0, 0, 1)", 1],
                    ["rgba(120, 120, 255, 1)", "rgba(0, 0, 0, 1)", 1]]
        }
    },

    //функции для работы с размерами и контекстом
    F: {
        //оба размера холста
        f_wh: function () {
            'use strict';
            return PAIR.CREATE.f_xy(
                main_canvas.width,
                main_canvas.height
            );
        },

        //растягивает канву по всему окну
        f_canvas_maximize: function () {
            'use strict';
            main_canvas.width = window.innerWidth;
            main_canvas.height = window.innerHeight;
        },

        //изменяет свойства полученного контекста рисования (всегда временно)
        f_ctx_set_new: function (arr_02_brush_pen_width) {
            'use strict';
            main_ctx.fillStyle = arr_02_brush_pen_width[0];
            main_ctx.strokeStyle = arr_02_brush_pen_width[1];
            main_ctx.lineWidth = arr_02_brush_pen_width[2];
        },

        //устанавливает круглую стыковку
        f_ctx_set_firstly: function () {
            'use strict';
            main_ctx.lineCap = 'round';
            main_ctx.lineJoin = 'round';
        }

    },

    //примитивы рисования
    PAINT: {
        //рисует эллипс по центру и двум радиусам
        f_ellipse_center: function (c, wh, sets_arr_02) {
            'use strict';
            //нулевой эллипс не рисуется (нулевого размера)
            if ((wh.y === 0) || (wh.x === 0)) {
                return;
            }

            main_ctx.save(); //сохрани старый стиль рисования
            DRAW.F.f_ctx_set_new(sets_arr_02); //измени стиль

            main_ctx.beginPath(); //начни рисовать заново

            //центр эллипса
            main_ctx.translate(c.x, c.y);
            //растяжение по х
            main_ctx.scale(wh.x / wh.y, 1);
            //полный круг, который растянется и сдвинется
            main_ctx.arc(0, 0, wh.y, 0, Math.PI * 2, true);

            main_ctx.fill(); //залей краской
            if (sets_arr_02[2] >= 1) {
                main_ctx.stroke(); //обведи контур
            }
            //восстанавливаем контекст
            main_ctx.restore();
        },

        //рисует эллипс по углам описанного прямоугольника
        f_ellipse_area: function (area, sets_arr_02) {
            'use strict';
            DRAW.PAINT.f_ellipse_center(
                PAIR.MATH.f_center_of_area(area),
                //радиусы равны половинам размеров области
                PAIR.MATH.f_same_mult(PAIR.MATH.f_dxy(area), 0.5),
                sets_arr_02
            );
        },

        //любое тримино по центру, шагам, радиусам, номеру и настройкам контекста
        f_trimino_any: function (c_00, step_xy, r_xy, fig_n05, sets_arr_02) {
            'use strict';
            var i, i_delta, i_center,
                trimino = STAT.C.ARR_TRIMINO[fig_n05]; //текущее тримино
            
            for (i = trimino.length - 1; i >= 0; i -= 1) {
                //сдвиг цетра текущего эллипса от нулевого элипса
                i_delta = PAIR.MATH.f_point_mult(trimino[i], step_xy);
                //координата центра рисуемого эллипса (абсолютная)
                i_center = PAIR.MATH.f_add(c_00, i_delta);
                DRAW.PAINT.f_ellipse_center(i_center, r_xy, sets_arr_02);
            }
        },

        //тримино внутри области
        f_trimino_area: function (area, r_01, fig_n05, sets_arr_02) {
            'use strict';
            var c_00 = PAIR.MATH.f_center_of_area(area),
                //1/3 от размера внешнего квадрата при r_01 = 1
                sq_side_x = (area.b.x - area.a.x) / (r_01 + 2),
                sq_side_y = (area.b.y - area.a.y) / (r_01 + 2),
                //шаг (расстояние между центрами) для обоих направлений
                step_xy = PAIR.CREATE.f_xy(sq_side_x, sq_side_y),
                //радиус = 1/2 диаметра (квадрата) * долю от максимума (r_01)
                r_xy = PAIR.MATH.f_same_mult(step_xy, r_01 / 2);
            DRAW.PAINT.f_trimino_any(c_00, step_xy, r_xy, fig_n05, sets_arr_02);
        },
        
        //рисуй линию по 2 точкам
        f_line: function (area, sets_arr_02) {
            'use strict';
            main_ctx.save();
            DRAW.F.f_ctx_set_new(sets_arr_02);

            main_ctx.beginPath();
            main_ctx.moveTo(area.a.x, area.a.y);
            main_ctx.lineTo(area.b.x, area.b.y);

            main_ctx.stroke();
            main_ctx.restore();
        },

        //рисуй прямоугольник по противоположным углам области
        f_rect: function (area, sets_arr_02) {
            'use strict';
            main_ctx.save();
            DRAW.F.f_ctx_set_new(sets_arr_02);

            main_ctx.beginPath();

            var wh = PAIR.MATH.f_dxy(area);
            main_ctx.rect(area.a.x, area.a.y, wh.x, wh.y);

            main_ctx.fill();
            main_ctx.stroke();
            main_ctx.restore();
        },
        
        //очищает всё окно
        f_cleaw_window_rect: function () {
            'use strict';
            var area = PAIR.CREATE.f_ab_00(DRAW.F.f_wh());
            DRAW.PAINT.f_rect(area, DRAW.CTX.back_ground);
        },

        //пишет одну строку в области
        f_text: function (get_area, get_text) {
            'use strict';
            var cut_w = (get_area.b.x - get_area.a.x) * 0.03,
                cut_h = (get_area.b.y - get_area.a.y) * 0.15,
                area = PAIR.CUT.f_wh(get_area, cut_w, cut_h),

                wh = PAIR.MATH.f_dxy(area),
                text_center = PAIR.MATH.f_center_of_area(area),
                text_h = wh.y;

            //установи контекст для всего текста
            function set_text_context() {
                main_ctx.save();
                main_ctx.textAlign = "center";
                main_ctx.textBaseline = "middle";
                //весь текст пишем чёрным
                main_ctx.fillStyle = "rgba(0, 0, 0, 1)";
            }

            //установи высоту текста
            function set_text_h(get_text_h) {
                main_ctx.font = "bold " + get_text_h + "pt Arial";
            }

            //сравни ширину текста с шириной области (текск шире?)
            function compare_text(get_compare_text) {
                return (main_ctx.measureText(get_compare_text).width > wh.x);
            }

            set_text_context(); //контекст специально для текста

            //установи размер текста, не превосходящий ширины
            for (set_text_h(text_h); compare_text(get_text); text_h -= 1) {
                set_text_h(text_h);
            }

            main_ctx.fillText(get_text, text_center.x, text_center.y);

            main_ctx.restore();
        },

        //пишет строки текста без фона + из них 1 строка с фоном
        f_text_arr: function (area, arr_text, line_n, line_n_rect_ctx) {
            'use strict';
            var i,
                n = arr_text.length,
                i_area = {};
            for (i = 0; i < n; i += 1) {
                //текущая строка
                i_area = PAIR.GRID.f_row_in_column(area, n, i);

                //эту строку надо выбрать
                if (i === line_n) {
                    //подсети прямоугольником
                    DRAW.PAINT.f_rect(i_area, line_n_rect_ctx);
                }

                //рисуй текст поверх фона
                DRAW.PAINT.f_text(i_area, arr_text[i]);
            }
        }
    }
};
